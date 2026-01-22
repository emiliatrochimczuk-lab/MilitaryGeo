// ---- IMPORTY ---- 
import { useEffect, useState, useRef, useMemo } from "react"; 
import { GeoJSON, useMap } from "react-leaflet"; 
// import axios from "axios";
// import osmtogeojson from "osmtogeojson"; 
import type {FeatureCollection, GeoJsonObject } from "geojson";
import L from "leaflet";
import type {MilitaryType} from "./types/military.ts";
import {MILITARY_TYPES, MILITARY_LABELS} from "./constants/military.ts";
import Legend from "./components/Legend.tsx";
import StyleControls from "./components/Style.tsx";

// ---- TYPY ---- 

// ---- LISTA TYPÓW ---- 
  
// ---- ETYKIETY ---- 


// ---- KOMPONENT MilitaryOSMLayer ----  
export default function MilitaryOSMLayer() {
    const [militaryType, setMilitaryType] = useState<MilitaryType>("naval_base");
    const [data, setData] = useState<GeoJsonObject | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const layerRef = useRef<L.GeoJSON>(null);
    const map = useMap();

// ---- FUNKCJA POBIERANIA DANYCH ---- 
const fetchData = async (type: MilitaryType) => { //asynchronizm żeby nie blokować gł wątku
    setLoading(true);
    
    try {
      setData(null); // asynchroniczność - wątek może robić inne rzeczy gdy czeka 
    
      const url = `/data/${type}.json`;
      const result = await fetch(url); //dzięki async await nie blokuje działania

      if (!result.ok) {
        console.error("File not found: ", url);
        setLoading(false);
        return;
      }

      const geojson = await result.json();
      setData(geojson);
    } catch (error) {
        console.error("File read error: ",error);
    } finally {
      setLoading(false);
    }
  };

// filtrowanie i liczenie
const filteredFeatures = useMemo(() => {
  if (!data || !("features" in data)) return [];

  return (data as FeatureCollection).features.filter((f) => {
    const props = f.properties;
    
    return props?.tags?.military === militaryType || props?.military === militaryType;
  });
}, [data, militaryType]);

const featureCount = filteredFeatures.length;

// zmiana stylu
const [geoStyle, setGeoStyle] = useState({
        color: "#0d47a1",
        weight: 2,
        opacity: 0.5
    });


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
    {/* ---- LOADER ---- */} 
    {loading && ( 
        <div style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            width: "100vw", 
            height: "100vh", 
            background: "rgba(0,0,0,0.5)", 
            zIndex: 99999, display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "white", 
            fontSize: "24px", 
            fontWeight: "bold", }}> 
          Ładowanie: {MILITARY_LABELS[militaryType]} 
        </div> )} 
    {/* ---- PRZYCISKI ---- */}
      <div style={{ 
        position: "absolute", 
        top: "20px", 
        left: "50px", 
        zIndex: 9999, 
        background: "rgba(255,255,255,0.9)", 
        padding: "10px", 
        borderRadius: "8px", 
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)", 
        width: "auto", 
        maxWidth: "80vw" 
        }}>
        <div style={{ 
          fontWeight: "bold", 
          marginBottom: "6px",
          color: "#000" 
          }}>
            Typ obiektu (Polska):
          </div>
        
        {MILITARY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setMilitaryType(type)}
            title={`Kliknij, aby zobaczyć: ${MILITARY_LABELS[type]}`} // TODO: Tooltip
            style={{ 
              margin: "4px", 
              padding: "6px 10px", 
              borderRadius: "6px", 
              border: "1px solid #555", 
              background: type === militaryType ? "#1a237e" : "#eee", 
              color: type === militaryType ? "#fff" : "#000", 
              cursor: "pointer" 
            }}
          >
            {MILITARY_LABELS[type]}
          </button>
        ))}
      </div> 
      
     <Legend 
      label={MILITARY_LABELS[militaryType]} 
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
