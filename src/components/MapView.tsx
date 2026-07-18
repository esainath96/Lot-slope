import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LotSample } from '../lib/api';
import { reverseGeocode } from '../lib/api';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

type MapViewProps = {
  sample: LotSample | null;
  onLocationSelect?: (address: string, lat: number, lng: number) => void;
};

// Component to recenter map when sample changes
const RecenterMap = ({ sample }: { sample: LotSample }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([sample.center.lat, sample.center.lng], 18);
  }, [sample, map]);
  return null;
};

// Component to handle clicks on the map
const MapClickDetector = ({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ sample, onLocationSelect }) => {
  const defaultCenter: [number, number] = [0, 0];
  
  const [clickedLocation, setClickedLocation] = useState<{lat: number, lng: number, address: string | null, loading: boolean} | null>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    setClickedLocation({ lat, lng, address: null, loading: true });
    try {
      const addr = await reverseGeocode(lat, lng);
      setClickedLocation({ lat, lng, address: addr, loading: false });
    } catch (e) {
      setClickedLocation({ lat, lng, address: 'Unknown location', loading: false });
    }
  };

  return (
    <div className="glass-panel" style={{ height: '400px', padding: '1rem', overflow: 'hidden' }}>
      <MapContainer 
        center={sample ? [sample.center.lat, sample.center.lng] : defaultCenter} 
        zoom={sample ? 18 : 2} 
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickDetector onLocationClick={handleMapClick} />

        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                {clickedLocation.loading ? (
                  <p>Finding address...</p>
                ) : (
                  <>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{clickedLocation.address}</p>
                    <button 
                      type="button"
                      className="btn" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLocationSelect) {
                          onLocationSelect(clickedLocation.address || 'Custom Location', clickedLocation.lat, clickedLocation.lng);
                        }
                      }}
                    >
                      Analyze this location
                    </button>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {sample && (
          <>
            <RecenterMap sample={sample} />
            <Marker position={[sample.center.lat, sample.center.lng]} />
            <Polygon 
              positions={[
                [sample.corners.nw.lat, sample.corners.nw.lng],
                [sample.corners.ne.lat, sample.corners.ne.lng],
                [sample.corners.se.lat, sample.corners.se.lng],
                [sample.corners.sw.lat, sample.corners.sw.lng],
              ]}
              pathOptions={{ color: 'var(--accent-color)', fillColor: 'var(--accent-color)', fillOpacity: 0.2 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
