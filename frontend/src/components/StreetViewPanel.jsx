import { MapPin, Globe, ExternalLink } from 'lucide-react';

const StreetViewPanel = ({ latlng, onClose }) => {
  const { lat, lng } = latlng;

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;

  return (
    <div className="h-full bg-astroCard flex flex-col">
      <div className="sticky top-0 bg-astroCard/95 backdrop-blur-lg border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-astroAccent" />
            Vista de calle
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <MapPin className="w-4 h-4" />
            Coordenadas del área seleccionada
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-astroDark/30 p-2 rounded">
              <p className="text-xs text-gray-500">Latitud</p>
              <p className="text-sm font-mono text-white">{lat.toFixed(4)}°</p>
            </div>
            <div className="bg-astroDark/30 p-2 rounded">
              <p className="text-xs text-gray-500">Longitud</p>
              <p className="text-sm font-mono text-white">{lng.toFixed(4)}°</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 h-[300px]">
          <iframe
            title="Street View"
            src={googleMapsUrl}
            className="w-full h-full"
            loading="lazy"
            allowFullScreen
          />
        </div>

        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-astroAccent/20 hover:bg-astroAccent/30 text-astroAccent rounded-xl border border-astroAccent/30 transition-all text-sm"
        >
          <Globe className="w-4 h-4" />
          Abrir en OpenStreetMap
        </a>
      </div>
    </div>
  );
};

export default StreetViewPanel;
