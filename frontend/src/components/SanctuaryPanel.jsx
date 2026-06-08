import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Thermometer, Cloud, Wind, Eye, Droplets, Mountain, MapPin, Video, Camera, Globe, Star, Compass, Award, Users, Heart, Clock, Image as ImageIcon } from 'lucide-react';
import ScorePanel from './ScoreBadge';
import ExperienceForm from './ExperienceForm';
import { calcGlobalScore } from '../utils/scoring';

const SanctuaryPanel = ({ zone, onClose }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;
  const [showForm, setShowForm] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [experiences, setExperiences] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://aadastra-sky-backend.onrender.com';

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoadingWeather(true);
      try {
        if (zone.latitude && zone.longitude) {
          const response = await axios.get(`${API_URL}/api/weather/current`, {
            params: { lat: zone.latitude, lon: zone.longitude, lang },
          });
          setWeatherData(response.data.data);
        } else {
          setWeatherData({ temperature: 18, cloudiness: 15, windSpeed: 12, windDirection: 'NE', visibility: 25, humidity: 45 });
        }
      } catch {
        setWeatherData({ temperature: 18, cloudiness: 15, windSpeed: 12, windDirection: 'NE', visibility: 25, humidity: 45 });
      } finally {
        setIsLoadingWeather(false);
      }
    };
    fetchWeatherData();
    fetch(`${API_URL}/api/experiences?zone_id=${zone.id}&limit=6`)
      .then(r => r.json())
      .then(data => { if (data.status === 'success') setExperiences(data.data.experiences); })
      .catch(() => {});
  }, [zone.latitude, zone.longitude, lang, zone.id]);

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const bortleLabels = {
    1: { label: 'Excelente', desc: 'Cielo prístino, Zodiacaal visible' },
    2: { label: 'Excelente', desc: 'Cielo oscuro, Láctea muy definida' },
    3: { label: 'Buena', desc: 'Contaminación lumínica leve' },
    4: { label: 'Buena', desc: 'Cielo rural-urbano' },
    5: { label: 'Aceptable', desc: 'Cielo suburbano' },
    6: { label: 'Aceptable', desc: 'Cielo suburbano brillante' },
    7: { label: 'Mala', desc: 'Cielo de transición' },
    8: { label: 'Muy mala', desc: 'Cielo urbano' },
    9: { label: 'Pésima', desc: 'Cielo de centro urbano' },
  };

  const darknessScore = Math.max(1, 11 - (zone.bortle_scale || 5));
  const bortleInfo = bortleLabels[zone.bortle_scale] || { label: 'Buena', desc: '' };
  const scores = zone.scores || calcGlobalScore(zone);

  const categoryNames = {
    observatory: 'Observatorio Astronómico',
    astronomical_viewpoint: 'Mirador Astronómico',
    landscape_viewpoint: 'Mirador Paisajístico',
  };

  const hasCoords = zone.latitude != null && zone.longitude != null;
  const osmIframeUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${zone.longitude - 0.02}%2C${zone.latitude - 0.02}%2C${zone.longitude + 0.02}%2C${zone.latitude + 0.02}&layer=mapnik&marker=${zone.latitude}%2C${zone.longitude}`
    : '';

  return (
    <div className="h-full overflow-y-auto bg-astroCard scrollbar-thin">
      <div className="sticky top-0 bg-astroCard/95 backdrop-blur-lg border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{zone.name}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{zone.island}</span>
        </div>
        <span className="inline-block px-3 py-1 bg-astroAccent/20 text-astroAccent text-xs font-medium rounded-full border border-astroAccent/30">
          {categoryNames[zone.category] || zone.category}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <img
            src={zone.image_url || `https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop`}
            alt={zone.name}
            className="w-full h-36 sm:h-48 object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {zone.image_url ? 'Imagen real' : 'Imagen de referencia'}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-astroAccent" />
            Puntuación AdAstraSky
          </h3>
          <ScorePanel astro={scores.astro} photo={scores.photo} tourism={scores.tourism} global={scores.global} />
        </div>

        {hasCoords && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-astroAccent" />
              Mapa 3D del lugar
            </h3>
            <div className="rounded-xl overflow-hidden border border-white/10 h-40">
              <iframe
                title="OSM Location"
                src={osmIframeUrl}
                className="w-full h-full"
                style={{ filter: 'invert(0.9) hue-rotate(180deg)' }}
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-astroAccent" />
            Condición actual ({new Date().toLocaleDateString(lang, { hour: '2-digit', minute: '2-digit' })})
          </h3>

          {isLoadingWeather ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`bg-astroDark/50 p-3 rounded-lg border border-white/10 animate-pulse ${i >= 4 ? 'col-span-2' : ''}`}>
                  <div className="h-4 bg-astroAccent/30 rounded mb-2 w-20" />
                  <div className="h-6 bg-white/20 rounded w-12" />
                </div>
              ))}
            </div>
          ) : weatherData ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Thermometer className="w-3 h-3" />Temperatura</div>
                <p className="text-xl font-bold text-white">{weatherData.temperature}°C</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Cloud className="w-3 h-3" />Nubosidad</div>
                <p className="text-xl font-bold text-white">{weatherData.cloudiness}%</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Wind className="w-3 h-3" />Viento</div>
                <p className="text-xl font-bold text-white">{weatherData.windSpeed} km/h</p>
                <p className="text-xs text-gray-500">{weatherData.windDirection}</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Eye className="w-3 h-3" />Visibilidad</div>
                <p className="text-xl font-bold text-white">{weatherData.visibility} km</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 col-span-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Droplets className="w-3 h-3" />Humedad</div>
                <p className="text-xl font-bold text-white">{weatherData.humidity}%</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No se pudieron obtener datos meteorológicos</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-astroAccent" />
            Calidad del cielo para astronomía
          </h3>
          <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Escala Bortle</span>
              <span className="text-2xl font-bold text-astroAccent">{zone.bortle_scale}/9</span>
            </div>
            <div className="relative h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-600">
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-astroAccent shadow-lg shadow-astroAccent/50"
                style={{ left: `${((zone.bortle_scale - 1) / 8) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 (Excelente)</span>
              <span>9 (Urbano)</span>
            </div>
            <p className="text-sm text-gray-300">{bortleInfo.desc}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-astroAccent" />
            Nivel de oscuridad del cielo
          </h3>
          <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Puntuación (1-10)</span>
              <span className={`text-3xl font-bold ${darknessScore >= 8 ? 'text-green-400' : darknessScore >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                {darknessScore}/10
              </span>
            </div>
            <div className="relative h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-400">
              <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-500 ${darknessScore >= 8 ? 'bg-green-400' : darknessScore >= 5 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ left: `${(darknessScore / 10) * 100}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Muy iluminado)</span>
              <span>10 (Totalmente oscuro)</span>
            </div>
            <p className="text-center text-sm text-gray-400 mt-2">
              {darknessScore >= 8 ? '🌌 Excelente para observación astronómica' :
               darknessScore >= 5 ? '🌃 Aceptable, cielos半 oscuros' :
               '🌆 Mala calidad, demasiada luz artificial'}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-astroAccent" />
            Experiencias de la comunidad
            {experiences.length > 0 && (
              <span className="text-xs font-normal text-gray-400 ml-1">({experiences.length})</span>
            )}
          </h3>
          <div className="space-y-3">
            {experiences.length === 0 ? (
              <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
                <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="text-sm">Sé el primero en compartir</p>
                  <p className="text-xs text-gray-600 mt-1">tu experiencia en este lugar</p>
                </div>
              </div>
            ) : (
              experiences.map(exp => (
                <div key={exp.id} className="bg-astroDark/50 rounded-lg border border-white/10 overflow-hidden md:hover:border-astroAccent/20 transition-colors">
                  {exp.images?.length > 0 && (
                    <img src={exp.images[0].startsWith('http') ? exp.images[0] : `${API_URL}${exp.images[0]}`}
                      alt={exp.title} className="w-full h-24 sm:h-32 object-contain bg-astroDark" />
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-astroAccent to-cosmicPurple flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white">
                          {exp.author?.first_name?.[0]}{exp.author?.last_name?.[0]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{exp.author?.first_name}</span>
                      <span className="text-[10px] text-gray-600 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(exp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1">{exp.title}</h4>
                    {exp.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <button onClick={() => setShowForm(true)}
              className="w-full py-2 text-sm text-astroAccent hover:text-astroAccent/80 border border-dashed border-astroAccent/30 hover:border-astroAccent/60 rounded-lg transition-colors">
              {experiences.length === 0
                ? 'Compartir experiencia'
                : 'Ver todas las experiencias →'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-astroAccent" />
            Coordenadas y altitud
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Latitud</p>
              <p className="text-lg font-bold text-white font-mono">
                {zone.latitude != null ? `${Number(zone.latitude).toFixed(4)}°` : '—'}
              </p>
            </div>
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Longitud</p>
              <p className="text-lg font-bold text-white font-mono">
                {zone.longitude != null ? `${Number(zone.longitude).toFixed(4)}°` : '—'}
              </p>
            </div>
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 col-span-2">
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-astroAccent" />
                <div>
                  <p className="text-xs text-gray-400">Altitud</p>
                  <p className="text-lg font-bold text-white">{zone.altitude != null ? `${zone.altitude} m` : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {zone.description && (
          <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Descripción</p>
            <p className="text-sm text-gray-300">{zone.description}</p>
          </div>
        )}
      </div>

      {showForm && (
        <ExperienceForm
          initialZoneId={zone.id}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetch(`${API_URL}/api/experiences?zone_id=${zone.id}&limit=6`)
              .then(r => r.json())
              .then(data => { if (data.status === 'success') setExperiences(data.data.experiences); })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
};

export default SanctuaryPanel;
