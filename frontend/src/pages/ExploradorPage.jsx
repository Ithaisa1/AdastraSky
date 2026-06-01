import { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import SanctuaryPanel from '../components/SanctuaryPanel';
import StreetViewPanel from '../components/StreetViewPanel';
import Sidebar from '../components/Sidebar';

const ExploradorPage = () => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [panel, setPanel] = useState(null);

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
    <div className="flex h-screen bg-astroDark overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative flex">
        <div className="flex-1 relative">
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
          <aside className="w-[420px] border-l border-white/10 overflow-y-auto z-[1001]">
            <SanctuaryPanel zone={selectedZone} onClose={handleClose} />
          </aside>
        )}

        {panel === 'streetview' && clickedCoords && (
          <aside className="w-[420px] border-l border-white/10 overflow-y-auto z-[1001]">
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
    <div className="absolute top-4 right-4 z-[1000] bg-astroCard/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 shadow-lg">
      <p className="text-xs text-gray-400 font-mono">{getLabel()}</p>
    </div>
  );
};

export default ExploradorPage;
