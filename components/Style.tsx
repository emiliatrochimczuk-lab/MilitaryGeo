import './Style.css'

interface StyleSettings {
  color: string;
  weight: number;
  opacity: number;
}

interface Props {
  settings: StyleSettings;
  onChange: (newSettings: StyleSettings) => void;
}

export default function StyleControls({ settings, onChange }: Props) {
  return (
    <div className="style-controls-panel">
      <h3>Stylizacja warstwy</h3>
      
      <div className="control-field">
        <label>Kolor linii i wypełnienia:</label>
        <input 
          type="color" 
          value={settings.color} 
          onChange={(e) => onChange({ ...settings, color: e.target.value })} 
        />
      </div>

      <div className="control-field">
        <label>Grubość linii: {settings.weight}px</label>
        <input 
          type="range" min="1" max="10" step="1" 
          value={settings.weight} 
          onChange={(e) => onChange({ ...settings, weight: parseInt(e.target.value) })} 
        />
      </div>

      <div className="control-field">
        <label>Nierzezroczystość: {Math.round(settings.opacity * 100)}%</label>
        <input 
          type="range" min="0" max="1" step="0.1" 
          value={settings.opacity} 
          onChange={(e) => onChange({ ...settings, opacity: parseFloat(e.target.value) })} 
        />
      </div>
    </div>
  );
}