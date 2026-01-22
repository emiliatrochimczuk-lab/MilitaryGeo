// ---- IMPORTY ---- 
import { useEffect, useState, useRef, useMemo } from "react"; 
import { GeoJSON, useMap } from "react-leaflet"; 
import type {FeatureCollection, GeoJsonObject } from "geojson";
import L from "leaflet";
import type {MilitaryType} from "./types/military.ts";
import {MILITARY_TYPES, MILITARY_LABELS} from "./constants/military.ts";
import Legend from "./components/Legend.tsx";
import StyleControls from "./components/Style.tsx";
import "./components/MilitaryLayer.css";

// ---- KOMPONENT MilitaryOSMLayer ----  
export default function MilitaryOSMLayer() {
  const [militaryType, setMilitaryType] = useState<MilitaryType | "all" >("all");
  const [data, setData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [geoStyle, setGeoStyle] = useState({
      color: "#1a237e",
      weight: 2,
      opacity: 0.5
  });

  const layerRef = useRef<L.GeoJSON>(null);
  const map = useMap();

// ---- FUNKCJA POBIERANIA DANYCH ---- 
  const fetchData = async (type: MilitaryType | "all") => { //asynchronizm żeby nie blokować gł wątku
    setLoading(true);
    
    try {
      setData(null);
      
      if (type === "all") {
          // pobieranie wszystkich plików naraz i łączenie ich
          const promises = MILITARY_TYPES.map(t => 
              fetch(`/data/${t}.json`).then(res => res.json())
          );
          const results = await Promise.all(promises);
          
          // łaczenie wielu FeatureCollection w jedną
          const combinedData: FeatureCollection = {
              type: "FeatureCollection",
              features: results.flatMap(geojson => geojson.features)
          };
          setData(combinedData);
      } else {
          // pobieranie pojedynczego pliku
          const result = await fetch(`/data/${type}.json`);
          if (!result.ok) throw new Error("Błąd ładowania");
          const geojson = await result.json();
          setData(geojson);
      }
    } catch (error) {
        console.error("File read error: ",error);
    } finally {
      setLoading(false);
    }
  };

// ---- liczenie obiektów ----
 const featureCount = useMemo(() => {
        if (!data || !("features" in data)) return 0;
        return (data as FeatureCollection).features.length;
    }, [data]);


// ---- useEffect: pobieranie danych ---- 
  useEffect(() => { fetchData(militaryType); }, [militaryType]); 

// ---- useEffect: dopasowanie widoku mapy ---- 
  useEffect(() => { 
    if (!data || !layerRef.current) return; 
      const bounds = layerRef.current.getBounds(); 
      if (bounds.isValid()) { 
        map.fitBounds(bounds, { animate: true });
      } 
    }, [data, map]); 
      
// ---- RENDER ---- 
  return ( 
    <> 
    {loading && ( 
        <div className="military-loader"> 
            Ładowanie: {militaryType === "all" ? "Wszystkie warstwy" : MILITARY_LABELS[militaryType as MilitaryType]} 
        </div> 
    )} 

    <div className="military-panel">
        <div className="military-panel-title">Typ obiektu:</div>
        {MILITARY_TYPES.map((type) => (
            <button
                key={type}
                onClick={() => setMilitaryType(type)}
                className={`military-btn ${militaryType === type ? "active" : ""}`}
            >
                {MILITARY_LABELS[type]}
            </button>
        ))}
        
        <button
            onClick={() => setMilitaryType("all")}
            className={`military-btn btn-all-layers ${militaryType === "all" ? "active" : ""}`}
        >
            Pokaż wszystkie warstwy naraz
        </button>
    </div>
      
     <Legend 
      label={militaryType === "all" ? "Wszystkie obiekty" : MILITARY_LABELS[militaryType as MilitaryType]} 
      count={featureCount} 
    />

    <StyleControls settings={geoStyle} onChange={setGeoStyle} />
       
    {/* ---- WARSTWA GEOJSON ---- */}
    {data && (
      <GeoJSON
        key={`${militaryType}-${JSON.stringify(geoStyle)}`}
        data={data}
        ref={layerRef}
        style={{
          color: geoStyle.color,
          weight: geoStyle.weight,
          fillColor: geoStyle.color,
          fillOpacity: geoStyle.opacity,
          opacity: 0.8
        }}
      />
    )}
    </>
  );
}
