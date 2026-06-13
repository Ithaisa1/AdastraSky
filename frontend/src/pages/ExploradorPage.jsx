import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';
import SanctuaryPanel from '../components/SanctuaryPanel';
import StreetViewPanel from '../components/StreetViewPanel';
import Sidebar from '../components/Sidebar';
import { santuariosData } from '../data/santuariosData';

const ExploradorPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedZone, setSelectedZone] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [panel, setPanel] = useState(null);

  const zoneMap = useMemo(() => {
    const m = {};
    santuariosData.forEach(z => { m[z.id] = z; });
    return m;
  }, []);

  useEffect(() => {
    if (location.state?.selectedZone) {
      const raw = location.state.selectedZone;
      const zone = typeof raw === 'string' ? zoneMap[raw] || raw : raw;
      setSelectedZone(zone);
      setPanel(zone?.id ? 'sanctuary' : null);
      setClickedCoords(null);
    }
  }, [location]);

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
          <InteractiveMap
            selectedZone={selectedZone}
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

export default ExploradorPage;