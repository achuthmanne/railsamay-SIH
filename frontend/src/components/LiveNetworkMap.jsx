import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to dynamically change map view based on the selected tab
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Coordinate dictionary for our specific hackathon stations and divisions
const COORDINATES = {
  // Divisions
  'Nagpur': [21.1458, 79.0882],
  'Delhi': [28.6139, 77.2090],
  'Secunderabad': [17.4399, 78.4983],
  'Vijayawada': [16.5062, 80.6200],
  
  // Specific Scenario Stations
  'Visakhapatnam (VSKP)': [17.7292, 83.2974],
  'Departed BPL (Bhopal)': [23.2599, 77.4126],
  'Departed BPQ (Balharshah)': [19.8488, 79.3565],
  'Arrived ET (Itarsi)': [22.6111, 77.7619],
  'Passing CD (Chandrapur)': [19.9482, 79.2982],
  'Departed ET (Itarsi)': [22.6111, 77.7619],
  'Approaching SEGM (Sevagram)': [20.7303, 78.6015],
  'Near BZU (Betul)': [21.9022, 77.9042],
  'Arrived SEGM (Sevagram)': [20.7303, 78.6015],
  'Departed SEGM (Sevagram)': [20.7303, 78.6015],
  'Departed PAR (Pandhurna)': [21.5975, 78.5284],
  'Balharshah (BPQ)': [19.8488, 79.3565],
  'Itarsi Jn (ET)': [22.6111, 77.7619],
  'Approaching NGP': [21.3, 78.9], 
  'At NGP Outer': [21.0, 79.2], 
  'Jalandhar Cantt (JRC)': [31.3005, 75.6178],
  'At PTKC (PF2)': [32.2612, 75.6293],
  'Approaching PTKC': [32.0, 75.6],
  'Khammam (KMT)': [17.2473, 80.1514],
  'KM-112 (Khammam Out)': [17.35, 80.12],
  'Tenali Jn (TEL)': [16.2378, 80.6475],
  'Approaching BZA': [16.45, 80.6]
};

const ZONE_COORDINATES = {
  'Central Railway (CR)': [20.0, 76.5], // Maharashtra/MP region
  'South Central Railway (SCR)': [16.8, 79.0], // TS/AP region
  'Northern Railway (NR)': [30.0, 76.0] // Punjab/Haryana/Delhi region
};

// Fallback coordinate generator if station isn't strictly defined
const getFallbackCoordinate = (stationName, division) => {
    let hash = 0;
    if (!stationName) return COORDINATES[division] || [22.9074, 79.3810];
    for (let i = 0; i < stationName.length; i++) hash = stationName.charCodeAt(i) + ((hash << 5) - hash);
    
    // Spread across India
    const base = [22.9074, 79.3810];
    const dLat = ((Math.abs(hash) % 150) - 75) / 10;
    const dLng = ((Math.abs(hash >> 8) % 150) - 75) / 10;
    
    return [base[0] + dLat, base[1] + dLng];
};

const LiveNetworkMap = ({ trains, division, zone, viewMode }) => {
  
  // Calculate Center and Zoom based on Zone vs Division
  const indiaCenter = [22.9074, 79.3810];
  const divisionCenter = COORDINATES[division] || indiaCenter;
  const zoneCenter = ZONE_COORDINATES[zone] || indiaCenter;
  
  const center = viewMode === 'Zone' ? zoneCenter : divisionCenter;
  // Division is tightly zoomed (8), Zone is moderately zoomed (6)
  const zoom = viewMode === 'Zone' ? 6 : 8;

  // Create custom sharp SVG pins
  const createIcon = (status, isConflict) => {
    const isRed = status !== 'On Time' || isConflict;
    const fillColor = isRed ? '#EF4444' : '#10B981'; // Tailwind red-500 or green-500
    const pingHtml = isRed ? `<div class="absolute -top-1 -left-1 w-8 h-8 bg-red-500 rounded-full opacity-40 animate-ping"></div>` : '';
    
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `<div class="relative flex flex-col items-center justify-center">
               ${pingHtml}
               <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10">
                 <path d="M12 0C5.373 0 0 5.373 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.373 18.627 0 12 0Z" fill="${fillColor}"/>
                 <circle cx="12" cy="12" r="5" fill="white"/>
               </svg>
             </div>`,
      iconSize: [24, 34],
      iconAnchor: [12, 34], // Anchored precisely at the sharp bottom tip
      popupAnchor: [0, -34]
    });
  };

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
      zoomControl={false}
      attributionControl={false}
    >
      <ChangeView center={center} zoom={zoom} />
      
      {/* Bulletproof Free OpenStreetMap tiles (100% No API Key ever, full cities/borders) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Train Markers */}
      {trains.map((train) => {
        let latLng = COORDINATES[train.currentLocation];
        
        // Manual override for Scenario 1 visual collision
        if (train.currentLocation === 'Approaching NGP') {
           if (train.no === '12626') latLng = COORDINATES['Approaching NGP'];
           if (train.no === '12621') latLng = COORDINATES['At NGP Outer'];
        }
        
        if (!latLng) latLng = getFallbackCoordinate(train.currentLocation, division);
        
        const isConflict = train.scenarioFlags?.some(f => f.includes('CONFLICT'));

        return (
          <Marker 
            key={train.no} 
            position={latLng} 
            icon={createIcon(train.status, isConflict)}
          >
            <Popup className="custom-popup">
              <div className="font-sans">
                <div className="font-bold text-slate-900 text-sm">{train.no} {train.name}</div>
                <div className="text-slate-600 text-xs mb-1">{train.currentLocation}</div>
                <div className={`text-xs font-bold ${train.status === 'On Time' ? 'text-green-600' : train.status === 'Not Started' ? 'text-slate-500' : 'text-red-600'}`}>
                  {train.status === 'Not Started' ? 'Train Not Started' : train.delayStr}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LiveNetworkMap;
