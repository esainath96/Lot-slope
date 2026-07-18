import React from 'react';

type ThresholdControlsProps = {
  flatThreshold: number;
  slopeThreshold: number;
  onFlatChange: (val: number) => void;
  onSlopeChange: (val: number) => void;
};

export const ThresholdControls: React.FC<ThresholdControlsProps> = ({
  flatThreshold,
  slopeThreshold,
  onFlatChange,
  onSlopeChange,
}) => {
  return (
    <div className="glass-panel" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Classification Settings</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Max Flat Delta (ft): {flatThreshold}ft
          </label>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.5" 
            value={flatThreshold} 
            onChange={(e) => onFlatChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--flat-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Max Slope Delta (ft): {slopeThreshold}ft
          </label>
          <input 
            type="range" 
            min={flatThreshold} 
            max="50" 
            step="0.5" 
            value={slopeThreshold} 
            onChange={(e) => onSlopeChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--slope-color)' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px', fontSize: '0.9rem' }}>
        <strong>Current Rule: </strong>
        0–{flatThreshold} ft = flat, {flatThreshold}–{slopeThreshold} ft = slope, {slopeThreshold} ft+ = steep
      </div>
    </div>
  );
};
