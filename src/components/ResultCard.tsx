import React from 'react';
import type { LotSample } from '../lib/api';
import { Circle, MoveRight, ArrowDownRight, Minus } from 'lucide-react';

type ResultCardProps = {
  sample: LotSample | null;
  flatThreshold: number;
  slopeThreshold: number;
};

export const ResultCard: React.FC<ResultCardProps> = ({
  sample,
  flatThreshold,
  slopeThreshold,
}) => {
  if (!sample) return null;

  const getClassification = () => {
    if (sample.delta <= flatThreshold) return 'flat';
    if (sample.delta <= slopeThreshold) return 'slope';
    return 'steep';
  };

  const classification = getClassification();

  const getStyle = () => {
    switch (classification) {
      case 'flat': return { color: 'var(--flat-color)', text: 'Flat', icon: <Minus size={48} />, anim: 'anim-flat' };
      case 'slope': return { color: 'var(--slope-color)', text: 'Slope', icon: <MoveRight size={48} />, anim: 'anim-slope' };
      case 'steep': return { color: 'var(--steep-color)', text: 'Steep', icon: <ArrowDownRight size={48} />, anim: 'anim-steep' };
    }
  };

  const style = getStyle();

  return (
    <div className="glass-panel flex-row-to-col-center">
      
      {/* Playful Icon Tile */}
      <div style={{
        background: '#f0f0f0',
        borderRadius: '16px',
        width: '120px',
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: style.color,
        border: `2px solid ${style.color}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className={style.anim} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Circle fill="currentColor" size={24} style={{ marginBottom: '4px' }} />
          {style.icon}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ color: style.color, fontSize: '2rem', marginBottom: '0.5rem' }}>{style.text}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          The highest corner is <strong>{sample.delta.toFixed(1)}ft</strong> above the lowest corner.
        </p>
        
        <div className="result-card-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
          <div style={{ background: '#f0f0f0', padding: '0.75rem', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Min Elevation</span>
            <strong>{sample.minElevation.toFixed(1)}ft</strong>
          </div>
          <div style={{ background: '#f0f0f0', padding: '0.75rem', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Max Elevation</span>
            <strong>{sample.maxElevation.toFixed(1)}ft</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
