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

  return (
    <div className="flex h-screen overflow-hidden bg-astroDark">
      <Sidebar />
      <main className="flex-1 relative flex flex-col md:flex-row p-3 overflow-hidden">
        <div className="flex-1 relative h-full">
          <InformacionHeader
            zone={selectedZone}
            coords={clickedCoords}
          />
          <InteractiveMap
            onZoneSelect={handleZoneSelect}
            onCoordinateClick={handleCoordinateClick}
          />
        </div>

        {panel === 'sanctuary' && selectedZone && (
          <aside className="w-full md:w-[420px] md:border-l border-white/10 z-[1001] max-h-[50vh] md:max-h-full h-full">
            <SanctuaryPanel zone={selectedZone} onClose={handleClose} />
          </aside>
        )}

        {panel === 'streetview' && clickedCoords && (
          <aside className="w-full md:w-[420px] md:border-l border-white/10 z-[1001] max-h-[50vh] md:max-h-full h-full">
            <StreetViewPanel latlng={clickedCoords} onClose={handleClose} />
          </aside>
        )}
      </main>
    </div>
  );
};

const InformacionHeader = ({ zone, coords }) => {
  const getLabel = () => {
    if (zone) return `${zone.name} · Bortle ${zone.bortle_scale} · ${zone.altitude}m`;
    if (coords) return `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}° · Explorando zona`;
    return 'Archipiélago Canarias · 75 zonas · Haz clic en un marcador o en cualquier punto';
  };

  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-[1000] bg-astroCard/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 shadow-lg">
      <p className="text-xs text-gray-400 font-mono truncate">{getLabel()}</p>
    </div>
  );
};

export default ExploradorPage;