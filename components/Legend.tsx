import React from 'react';
import './Legend.css';

interface LegendProps {
  label: string;
  count: number;
}

const Legend: React.FC<LegendProps> = ({ label, count }) => {
  console.log("Legenda renderuje:", label, count);

  return (
    <div className="map-legend-panel">
      <div className="legend-header">Aktualny typ:</div>
      <div className="legend-value">{label || "Brak danych"}</div>
      <div className="legend-count">Liczba obiektów: <strong>{count}</strong></div>
    </div>
  );
};

export default Legend;