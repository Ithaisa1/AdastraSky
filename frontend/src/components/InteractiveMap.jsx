import { useState, useEffect } from 'react';
import { MapContainer, WMSTileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { DivIcon, latLngBounds } from 'leaflet';
import { santuariosData, islands } from '../data/santuariosData';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

const categoryConfig = {
  all:                    { icon: '📍', dot: 'bg-gray-400' },
  observatory:            { icon: '🔭', dot: 'bg-violet-500' },
  astronomical_viewpoint: { icon: '🌌', dot: 'bg-amber-500' },
  landscape_viewpoint:    { icon: '🏞️', dot: 'bg-emerald-500' },
};

// Archipiélago completo (de El Hierro a La Graciosa) y margen máximo de desplazamiento
const CANARIAS_BOUNDS = [[27.6, -18.2], [29.45, -13.35]];
const MAX_BOUNDS = [[26.6, -19.6], [30.4, -12.2]];

const GRAFCAN_ATTRIBUTION =
  'Cartografía &copy; <a href="https://www.grafcan.es" target="_blank" rel="noopener noreferrer">GRAFCAN</a> · <a href="https://www.idecanarias.es" target="_blank" rel="noopener noreferrer">IDECanarias</a> (uso no comercial)';

// Mapas base: cartografía oficial del Gobierno de Canarias (GRAFCAN). Son servicios WMS públicos que no necesitan clave.
const BASE_LAYERS = {
  topo: {
    url: 'https://idecan2.grafcan.es/ServicioWMS/MTI',
    layers: 'WMS_MTI',
    format: 'image/png',
    attribution: GRAFCAN_ATTRIBUTION,
    background: '#c6dbf7',
  },
  ortho: {
    url: 'https://idecan1.grafcan.es/ServicioWMS/OrtoExpress',
    layers: 'ortoexpress',
    format: 'image/jpeg',
    attribution: GRAFCAN_ATTRIBUTION,
    background: '#000000',
  },
  // Mismo mapa topográfico con los colores invertidos: estilo nocturno sin depender de servicios de pago
  dark: {
    url: 'https://idecan2.grafcan.es/ServicioWMS/MTI',
    layers: 'WMS_MTI',
    format: 'image/png',
    attribution: GRAFCAN_ATTRIBUTION,
    background: '#283447',
    className: 'map-night',
  },
};

const BASE_LAYER_KEY = 'adastra.map.baseLayer';
const readBaseLayer = () => {
  try {
    const v = localStorage.getItem(BASE_LAYER_KEY);
    return v && BASE_LAYERS[v] ? v : 'topo';
  } catch {
    return 'topo';
  }
};

const markerConfig = {
  observatory:            { bg: 'bg-violet-500',  border: 'border-violet-400',  icon: '🔭' },
  astronomical_viewpoint: { bg: 'bg-amber-500',   border: 'border-amber-400',   icon: '🌌' },
  landscape_viewpoint:    { bg: 'bg-emerald-500', border: 'border-emerald-400', icon: '🏞️' },
};

const createCustomIcon = (category) => {
  const m = markerConfig[category] || markerConfig.landscape_viewpoint;
  const iconHtml = `<div class="${m.bg} p-1 rounded-full shadow-lg border-2 ${m.border} text-sm leading-none">${m.icon}</div>`;
  return new DivIcon({ html: iconHtml, className: 'custom-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
};

const MapClickHandler = ({ onCoordinateClick }) => {
  useMapEvents({
    click: (e) => { if (onCoordinateClick) onCoordinateClick(e.latlng); },
  });
  return null;
};

const MapFlyTo = ({ zone }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (zone?.latitude && zone?.longitude) {
      map.flyTo([zone.latitude, zone.longitude], 12, { duration: 1.2 });
    }
  }, [zone, map]);
  return null;
};

// Encuadra la isla elegida en el filtro, o todo el archipiélago
const FitIsland = ({ island, zones }) => {
  const map = useMap();
  useEffect(() => {
    const points = island === 'all' ? [] : zones.map((z) => [z.latitude, z.longitude]);
    if (points.length > 0) {
      map.flyToBounds(latLngBounds(points), { padding: [60, 60], maxZoom: 11, duration: 1 });
    } else {
      map.flyToBounds(CANARIAS_BOUNDS, { duration: 1 });
    }
  }, [island, map]); // solo al cambiar de isla, no al filtrar categorías
  return null;
};

const InteractiveMap = ({ selectedZone, onZoneSelect, onCoordinateClick }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIsland, setSelectedIsland] = useState('all');
  const [legendOpen, setLegendOpen] = useState(false);
  const [baseLayer, setBaseLayer] = useState(readBaseLayer);
  const base = BASE_LAYERS[baseLayer];

  const changeBaseLayer = (id) => {
    setBaseLayer(id);
    try { localStorage.setItem(BASE_LAYER_KEY, id); } catch { /* sin almacenamiento */ }
  };

  const filteredZones = santuariosData.filter((zone) => {
    const catMatch = selectedCategory === 'all' || zone.category === selectedCategory;
    const islMatch = selectedIsland === 'all' || zone.island === selectedIsland;
    return catMatch && islMatch;
  });

  return (
    <div className="relative h-full w-full overflow-hidden">

      {/*
        Filtro de islas.
        - En móvil: top-12 para no solaparse con el InformacionHeader (que está en top-2/top-4)
        - En md+: top-4 como antes
      */}
      <div className="absolute top-12 md:top-4 left-1/2 -translate-x-1/2 z-[1000] bg-astroCard/90 backdrop-blur-lg rounded-lg p-2 border border-white/10 shadow-xl max-w-[90vw] md:max-w-none">
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
              {island.id === 'all' ? t('map.allIslands') : island.label}
            </button>
          ))}
        </div>
      </div>

      {/*
        Leyenda.
        - En móvil: botón toggle que expande/colapsa para no tapar el mapa
        - En md+: siempre visible como antes
      */}
      {/* Texto informativo — abajo a la derecha */}
      <div className="absolute bottom-4 right-2 md:right-4 z-[1000]">
        <div className="bg-astroCard/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 shadow-lg">
          <p className="text-xs text-gray-400 font-mono truncate">{t('map.hint')}</p>
        </div>
      </div>

      {/* Botón toggle móvil + Leyenda — abajo a la izquierda */}
      <div className="absolute bottom-4 left-2 md:left-4 z-[1000]">

        <button
          className="md:hidden mb-1 bg-astroCard/90 backdrop-blur-lg rounded-lg px-3 py-2 border border-white/10 text-[10px] text-gray-400 font-mono flex items-center gap-2 w-full"
          onClick={() => setLegendOpen((v) => !v)}
          aria-expanded={legendOpen}
        >
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">{t('map.legend')}</span>
          <span className="ml-auto">{legendOpen ? '▲' : '▼'}</span>
        </button>

        {/* Panel de leyenda: en móvil solo se muestra si legendOpen, en md+ siempre */}
        <div
          className={`bg-astroCard/90 backdrop-blur-lg rounded-lg p-3 border border-white/10 shadow-xl min-w-[160px] md:min-w-[200px] max-w-[calc(100vw-16px)] md:max-w-none
            ${legendOpen ? 'block' : 'hidden'} md:block`}
        >
          <p className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-[0.3em] mb-2 border-b border-white/10 pb-1 hidden md:block">
            {t('map.legend')}
          </p>
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
                <span
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${cfg.dot} ${
                    selectedCategory === id ? 'ring-2 ring-white/50' : ''
                  }`}
                />
                <span>{cfg.icon}</span>
                <span>{t(`map.cat.${id}`)}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-[0.3em] mt-3 mb-2 border-b border-white/10 pb-1">
            {t('map.baseLayer')}
          </p>
          <div className="flex gap-1" role="radiogroup" aria-label={t('map.baseLayer')}>
            {Object.keys(BASE_LAYERS).map((id) => (
              <button
                key={id}
                role="radio"
                aria-checked={baseLayer === id}
                onClick={() => changeBaseLayer(id)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] md:text-xs font-medium transition-all ${
                  baseLayer === id ? 'bg-astroAccent text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {t(`map.layers.${id}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MapContainer
        bounds={CANARIAS_BOUNDS}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.8}
        minZoom={7}
        maxZoom={18}
        style={{ height: '100%', width: '100%', background: base.background }}
      >
        <WMSTileLayer
          key={baseLayer}
          url={base.url}
          layers={base.layers}
          format={base.format}
          transparent={false}
          version="1.1.1"
          tileSize={512}
          className={base.className}
          attribution={base.attribution}
        />

        <FitIsland island={selectedIsland} zones={filteredZones} />

        <MapClickHandler onCoordinateClick={onCoordinateClick} />
        <MapFlyTo zone={selectedZone} />

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