import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { santuariosData, islands } from '../data/santuariosData';
import 'leaflet/dist/leaflet.css';

const categoryConfig = {
  all:               { icon: '📍', dot: 'bg-gray-400', label: 'Todos' },
  observatory:       { icon: '🔭', dot: 'bg-violet-500', label: 'Observatorios' },
  astronomical_viewpoint: { icon: '🌌', dot: 'bg-amber-500', label: 'Miradores Astronómicos' },
  landscape_viewpoint:    { icon: '🏞️', dot: 'bg-emerald-500', label: 'Miradores Paisajísticos' },
};

const markerConfig = {
  observatory:            { bg: 'bg-violet-500', border: 'border-violet-400', icon: '🔭' },
  astronomical_viewpoint: { bg: 'bg-amber-500', border: 'border-amber-400', icon: '🌌' },
  landscape_viewpoint:    { bg: 'bg-emerald-500', border: 'border-emerald-400', icon: '🏞️' },
};

const createCustomIcon = (category) => {
  const m = markerConfig[category] || markerConfig.landscape_viewpoint;
  const iconHtml = `<div class="${m.bg} p-2 rounded-full shadow-lg border-2 ${m.border}">${m.icon}</div>`;
  return new DivIcon({ html: iconHtml, className: 'custom-marker', iconSize: [40, 40], iconAnchor: [20, 20] });
};

const MapClickHandler = ({ onCoordinateClick }) => {
  useMapEvents({
    click: (e) => { if (onCoordinateClick) onCoordinateClick(e.latlng); },
  });
  return null;
};

const InteractiveMap = ({ onZoneSelect, onCoordinateClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIsland, setSelectedIsland] = useState('all');

  const filteredZones = santuariosData.filter((zone) => {
    const catMatch = selectedCategory === 'all' || zone.category === selectedCategory;
    const islMatch = selectedIsland === 'all' || zone.island === selectedIsland;
    return catMatch && islMatch;
  });

  return (
    <div className="h-full w-full">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-astroCard/90 backdrop-blur-lg rounded-lg p-2 border border-white/10 shadow-xl max-w-[90vw] md:max-w-none">
        <div className="flex gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {islands.map((island) => (
            <button
              key={island.id}
              onClick={() => setSelectedIsland(island.id)}
              className={`px-2 md:px-3 py-2 rounded-lg text-[11px] md:text-sm font-mono font-medium transition-all whitespace-nowrap ${
                selectedIsland === island.id
                  ? 'bg-astroAccent text-white shadow-lg shadow-astroAccent/50'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {island.label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-2 md:left-4 z-[1000] bg-astroCard/90 backdrop-blur-lg rounded-lg p-3 border border-white/10 shadow-xl min-w-[160px] md:min-w-[200px] max-w-[calc(100vw-16px)] md:max-w-none">
        <p className="text-[10px] md:text-xs text-gray-400 font-mono mb-2 border-b border-white/10 pb-1">L E Y E N D A</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(categoryConfig).map(([id, cfg]) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                selectedCategory === id
                  ? 'bg-astroAccent/20 text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${cfg.dot} ${selectedCategory === id ? 'ring-2 ring-white/50' : ''}`} />
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <MapContainer
        center={[28.2917, -16.5111]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="bg-astroDark"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onCoordinateClick={onCoordinateClick} />

        {filteredZones.map((zone) => (
          <Marker
            key={zone.id}
            position={[zone.latitude, zone.longitude]}
            icon={createCustomIcon(zone.category)}
            eventHandlers={{ click: () => onZoneSelect(zone) }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
