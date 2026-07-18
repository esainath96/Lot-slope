import { useState } from 'react';
import { processLot, processLotFromCoords, type LotSample } from './lib/api';
import { ThresholdControls } from './components/ThresholdControls';
import { ResultCard } from './components/ResultCard';
import { MapView } from './components/MapView';
import { SearchBar } from './components/SearchBar';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sample, setSample] = useState<LotSample | null>(null);

  const [flatThreshold, setFlatThreshold] = useState(1);
  const [slopeThreshold, setSlopeThreshold] = useState(4);

  const handleSearch = async (addressToSearch: string) => {
    if (!addressToSearch.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await processLot(addressToSearch);
      setSample(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSample(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (addressName: string, lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await processLotFromCoords(addressName, { lat, lng });
      setSample(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSample(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
        <img src="/logo.jpg" alt="LotSlope Logo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--accent-color)' }}>LotSlope</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 'bold' }}>Terrain Analyzer</p>
        </div>
      </header>

      <div className="glass-panel" style={{ zIndex: 10 }}>
        <SearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      <ThresholdControls 
        flatThreshold={flatThreshold}
        slopeThreshold={slopeThreshold}
        onFlatChange={(val) => {
          setFlatThreshold(val);
          if (val > slopeThreshold) setSlopeThreshold(val);
        }}
        onSlopeChange={(val) => {
          setSlopeThreshold(val);
          if (val < flatThreshold) setFlatThreshold(val);
        }}
      />

      {error && (
        <div className="glass-panel" style={{ color: 'var(--steep-color)', border: '1px solid var(--steep-color)' }}>
          {error}
        </div>
      )}

      {sample && (
        <>
          <ResultCard 
            sample={sample} 
            flatThreshold={flatThreshold} 
            slopeThreshold={slopeThreshold} 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <MapView sample={sample} onLocationSelect={handleLocationSelect} />
          </div>
        </>
      )}

      {!sample && !loading && !error && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', opacity: 0.5 }}>
            <div className="anim-flat"><CircleIcon color="var(--flat-color)" /></div>
            <div className="anim-slope"><CircleIcon color="var(--slope-color)" /></div>
            <div className="anim-steep"><CircleIcon color="var(--steep-color)" /></div>
          </div>
          <p>Enter an address above, or click anywhere on the map to analyze a location.</p>
        </div>
      )}

      {/* Show map even when no sample is selected so users can click it */}
      {!sample && (
        <MapView sample={null} onLocationSelect={handleLocationSelect} />
      )}

    </div>
  );
}

const CircleIcon = ({ color }: { color: string }) => (
  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${color}` }} />
);

export default App;
