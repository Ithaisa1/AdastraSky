/**
 * AdastraSky Frontend - Mapa Interactivo de Exploración
 * React Leaflet con marcadores diferenciados por categoría y filtros por islas
 */

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { santuariosData, categories, islands } from '../data/santuariosData';
import 'leaflet/dist/leaflet.css';

// Iconos personalizados para cada categoría con colores específicos
const createCustomIcon = (category) => {
  let iconHtml = '';

  if (category === 'observatory') {
    // Violeta para observatorios oficiales
    iconHtml = `<div class="bg-violet-500 p-2 rounded-full shadow-lg border-2 border-violet-400">🔭</div>`;
  } else if (category === 'astronomical_viewpoint') {
    // Dorado para miradores astronómicos
    iconHtml = `<div class="bg-amber-500 p-2 rounded-full shadow-lg border-2 border-amber-400">🌌</div>`;
  } else {
    // Verde para miradores paisajísticos
    iconHtml = `<div class="bg-emerald-500 p-2 rounded-full shadow-lg border-2 border-emerald-400">🏞️</div>`;
  }

  return new DivIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const MapClickHandler = ({ onCoordinateClick }) => {
  useMapEvents({
    click: (e) => {
      onCoordinateClick(e.latlng);
    },
  });
  return null;
};

const InteractiveMap = ({ onZoneSelect, onCoordinateClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIsland, setSelectedIsland] = useState('all');

  const filteredZones = santuariosData.filter((zone) => {
    const categoryMatch = selectedCategory === 'all' || zone.category === selectedCategory;
    const islandMatch = selectedIsland === 'all' || zone.island === selectedIsland;
    return categoryMatch && islandMatch;
  });

  return (
    <div className="h-full w-full">
      {/* Filtros de islas - Barra horizontal superior */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-astroCard/90 backdrop-blur-lg rounded-lg p-2 border border-white/10 shadow-xl">
        <div className="flex gap-2">
          {islands.map((island) => (
            <button
              key={island.id}
              onClick={() => setSelectedIsland(island.id)}
              className={`px-3 py-2 rounded-lg text-sm font-mono font-medium transition-all ${
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

      {/* Filtros de categoría - Panel flotante en la parte inferior izquierda */}
      <div className="absolute bottom-4 left-42 z-[1000] bg-astroCard/90 backdrop-blur-lg rounded-lg p-3 border border-white/10 shadow-xl">
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-astroAccent text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <MapContainer
        center={[28.2917, -16.5111]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="bg-astroDark"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onCoordinateClick={onCoordinateClick} />

        {filteredZones.map((zone) => (
          <Marker
            key={zone.id}
            position={[zone.latitude, zone.longitude]}
            icon={createCustomIcon(zone.category)}
            eventHandlers={{
              click: () => onZoneSelect(zone),
            }}
          >
            <Popup className="bg-astroCard text-white border-astroAccent">
              <div className="p-2">
                <h3 className="font-semibold text-lg">{zone.name}</h3>
                <p className="text-sm text-gray-300">{zone.island}</p>
                <p className="text-xs text-astroAccent mt-1">Bortle: {zone.bortle_scale}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
