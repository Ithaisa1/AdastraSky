import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';
import SanctuaryPanel from '../components/SanctuaryPanel';
import StreetViewPanel from '../components/StreetViewPanel';
import Sidebar from '../components/Sidebar';

const ExploradorPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedZone, setSelectedZone] = useState(location.state?.selectedZone || null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [panel, setPanel] = useState(location.state?.selectedZone ? 'sanctuary' : null);

  useEffect(() => {
    if (location.state?.selectedZone) {
      setSelectedZone(location.state.selectedZone);
      setPanel('sanctuary');
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleZoneSelect = (zone) => {
    setClickedCoords(null);
    setSelectedZone(zone);
    setPanel('sanctuary');
  };

  const handleCoordinateClick = (latlng) => {
    setSelectedZone(null);
    setClickedCoords(latlng);
    setPanel('streetview');
  };

  const handleClose = () => {
    setSelectedZone(null);
    setClickedCoords(null);
    setPanel(null);
  };

  const hasPanel = panel !== null;

  return (
    <div className="flex h-screen overflow-hidden bg-astroDark">
      <Sidebar />

      {/*
        En móvil el botón hamburguesa es fixed top-4 left-4,
        así que compensamos con pt-14. En md+ no hace falta.
      */}
      <main className="flex-1 relative flex flex-row pt-14 md:pt-0 overflow-hidden">

        {/* Mapa: siempre ocupa todo el espacio disponible */}
        <div className="flex-1 relative h-full">
          <InformacionHeader
            zone={selectedZone}
            coords={clickedCoords}
            hasPanel={hasPanel}
          />
          <InteractiveMap
            onZoneSelect={handleZoneSelect}
            onCoordinateClick={handleCoordinateClick}
          />
        </div>

        {/* ── PANEL EN TABLET / DESKTOP: columna lateral derecha ── */}
        {panel === 'sanctuary' && selectedZone && (
          <aside className="hidden md:flex md:w-[420px] md:border-l border-white/10 z-[1001] h-full flex-col">
            <SanctuaryPanel zone={selectedZone} onClose={handleClose} />
          </aside>
        )}

        {panel === 'streetview' && clickedCoords && (
          <aside className="hidden md:flex md:w-[420px] md:border-l border-white/10 z-[1001] h-full flex-col">
            <StreetViewPanel latlng={clickedCoords} onClose={handleClose} />
          </aside>
        )}

        {/* ── PANEL EN MÓVIL: bottom sheet superpuesto al mapa ── */}
        {panel === 'sanctuary' && selectedZone && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[1002] h-[60vh] rounded-t-2xl overflow-hidden border-t border-white/10 shadow-2xl bg-astroCard">
            <SanctuaryPanel zone={selectedZone} onClose={handleClose} />
          </div>
        )}

        {panel === 'streetview' && clickedCoords && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[1002] h-[60vh] rounded-t-2xl overflow-hidden border-t border-white/10 shadow-2xl bg-astroCard">
            <StreetViewPanel latlng={clickedCoords} onClose={handleClose} />
          </div>
        )}

        {/* Overlay semitransparente detrás del bottom sheet en móvil */}
        {hasPanel && (
          <div
            className="md:hidden fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
      </main>
    </div>
  );
};

const InformacionHeader = ({ zone, coords, hasPanel }) => {
  const getLabel = () => {
    if (zone) return `${zone.name} · Bortle ${zone.bortle_scale} · ${zone.altitude}m`;
    if (coords) return `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}° · Explorando zona`;
    return 'Haz clic en un marcador o en cualquier punto para explorar';
  };

  return (
    /*
      En móvil con panel abierto subimos el header un poco
      para que no quede pegado al borde del bottom sheet.
      En desktop siempre top-4.
    */
    <div
      className={`absolute left-4 right-4 z-[1000] bg-astroCard/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 shadow-lg transition-all duration-300 ${
        hasPanel ? 'top-2 md:top-4' : 'top-4'
      }`}
    >
      <p className="text-xs text-gray-400 font-mono truncate">{getLabel()}</p>
    </div>
  );
};

export default ExploradorPage;