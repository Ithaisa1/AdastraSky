import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Thermometer, Cloud, Wind, Eye, Droplets, Mountain, MapPin, Camera, Globe, Star, Compass, Award, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ScorePanel from './ScoreBadge';
import ExperienceForm from './ExperienceForm';
import { calcGlobalScore } from '../utils/scoring';
import { API_URL } from '../config/api';

const SanctuaryPanel = ({ zone, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;
  const [showForm, setShowForm] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [experiences, setExperiences] = useState([]);


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
          setWeatherData(null);
        }
      } catch {
        // Sin datos reales no se muestra nada inventado
        setWeatherData(null);
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


  const darknessScore = Math.max(1, 11 - (zone.bortle_scale || 5));
  const bortleDesc = zone.bortle_scale >= 1 && zone.bortle_scale <= 9 ? t(`sanctuaryPanel.bortle.${zone.bortle_scale}`) : '';
  const scores = zone.scores || calcGlobalScore(zone);

  const hasCoords = zone.latitude != null && zone.longitude != null;
  const osmIframeUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${zone.longitude - 0.02}%2C${zone.latitude - 0.02}%2C${zone.longitude + 0.02}%2C${zone.latitude + 0.02}&layer=mapnik&marker=${zone.latitude}%2C${zone.longitude}`
    : '';

  return (
    <div className="h-full overflow-y-auto bg-astroCard scrollbar-thin">
      <div className="sticky top-0 bg-astroCard/95 backdrop-blur-lg border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} aria-label={t('common.close')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{zone.name}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{zone.island}</span>
        </div>
        <span className="inline-block px-3 py-1 bg-astroAccent/20 text-astroAccent text-xs font-medium rounded-full border border-astroAccent/30">
          {t(`categories.${zone.category}`, { defaultValue: zone.category })}
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
            {zone.image_url ? t('sanctuaryPanel.realImage') : t('sanctuaryPanel.referenceImage')}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-astroAccent" />
            {t('sanctuaryPanel.score')}
          </h3>
          <ScorePanel astro={scores.astro} photo={scores.photo} tourism={scores.tourism} global={scores.global} />
        </div>

        {hasCoords && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-astroAccent" />
              {t('sanctuaryPanel.map')}
            </h3>
            <div className="rounded-xl overflow-hidden border border-white/10 h-40">
              <iframe
                title={t('sanctuaryPanel.map')}
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
            {t('sanctuaryPanel.currentConditions')} ({new Date().toLocaleDateString(lang, { hour: '2-digit', minute: '2-digit' })})
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
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Thermometer className="w-3 h-3" aria-hidden="true" />{t('sanctuary.temperature')}</div>
                <p className="text-xl font-bold text-white">{weatherData.temperature}°C</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Cloud className="w-3 h-3" aria-hidden="true" />{t('sanctuary.cloudiness')}</div>
                <p className="text-xl font-bold text-white">{weatherData.cloudiness}%</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Wind className="w-3 h-3" aria-hidden="true" />{t('sanctuary.wind')}</div>
                <p className="text-xl font-bold text-white">{weatherData.windSpeed} km/h</p>
                <p className="text-xs text-gray-500">{weatherData.windDirection}</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Eye className="w-3 h-3" aria-hidden="true" />{t('sanctuary.visibility')}</div>
                <p className="text-xl font-bold text-white">{weatherData.visibility} km</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 col-span-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Droplets className="w-3 h-3" aria-hidden="true" />{t('sanctuary.humidity')}</div>
                <p className="text-xl font-bold text-white">{weatherData.humidity}%</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm" role="status">{t('sanctuaryPanel.noWeather')}</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-astroAccent" />
            {t('sanctuaryPanel.skyQuality')}
          </h3>
          <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{t('sanctuary.bortleScale')}</span>
              <span className="text-2xl font-bold text-astroAccent">{zone.bortle_scale}/9</span>
            </div>
            <div className="relative h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-600">
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-astroAccent shadow-lg shadow-astroAccent/50"
                style={{ left: `${((zone.bortle_scale - 1) / 8) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('sanctuaryPanel.bortleMin')}</span>
              <span>{t('sanctuaryPanel.bortleMax')}</span>
            </div>
            <p className="text-sm text-gray-300">{bortleDesc}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-astroAccent" />
            {t('sanctuaryPanel.darkness')}
          </h3>
          <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{t('sanctuaryPanel.darknessScore')}</span>
              <span className={`text-3xl font-bold ${darknessScore >= 8 ? 'text-green-400' : darknessScore >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                {darknessScore}/10
              </span>
            </div>
            <div className="relative h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-400">
              <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-500 ${darknessScore >= 8 ? 'bg-green-400' : darknessScore >= 5 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ left: `${(darknessScore / 10) * 100}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('sanctuaryPanel.darknessMin')}</span>
              <span>{t('sanctuaryPanel.darknessMax')}</span>
            </div>
            <p className="text-center text-sm text-gray-400 mt-2">
              {darknessScore >= 8 ? `🌌 ${t('sanctuaryPanel.darknessHigh')}` :
               darknessScore >= 5 ? `🌃 ${t('sanctuaryPanel.darknessMid')}` :
               `🌆 ${t('sanctuaryPanel.darknessLow')}`}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-astroAccent" />
            {t('sanctuaryPanel.community')}
            {experiences.length > 0 && (
              <span className="text-xs font-normal text-gray-400 ml-1">({experiences.length})</span>
            )}
          </h3>
          <div className="space-y-3">
            {experiences.length === 0 ? (
              <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
                <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="text-sm">{t('sanctuaryPanel.beFirst')}</p>
                  <p className="text-xs text-gray-600 mt-1">{t('sanctuaryPanel.beFirstDetail')}</p>
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
                        {new Date(exp.created_at).toLocaleDateString(lang)}
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
            <div className="flex gap-2">
              {experiences.length > 0 && (
                <button onClick={() => { setCarouselIdx(0); setShowCarousel(true); }}
                  className="flex-1 py-2 text-sm text-cyan-300 hover:text-cyan-200 bg-cyan-900/20 border border-cyan-700/30 hover:bg-cyan-900/40 hover:border-cyan-500/50 rounded-lg transition-colors">
                  {t('sanctuaryPanel.viewExperiences')}
                </button>
              )}
              <button onClick={() => setShowForm(true)}
                className={`py-2 text-sm rounded-lg transition-colors ${experiences.length > 0 ? 'flex-1 text-astroAccent border border-dashed border-astroAccent/30 hover:border-astroAccent/60' : 'w-full text-astroAccent border border-dashed border-astroAccent/30 hover:border-astroAccent/60'}`}>
                {t('experiences.share')}
              </button>
            </div>
          </div>
        </div>

        {/* Carrusel de experiencias */}
        {showCarousel && experiences.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCarousel(false)}>
            <div className="relative bg-astroCard rounded-2xl border border-white/10 w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowCarousel(false)} aria-label={t('common.close')}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="relative h-64 sm:h-80 bg-astroDark flex items-center justify-center">
                {experiences[carouselIdx]?.images?.length > 0 ? (
                  <img
                    src={experiences[carouselIdx].images[0].startsWith('http') ? experiences[carouselIdx].images[0] : `${API_URL}${experiences[carouselIdx].images[0]}`}
                    alt={experiences[carouselIdx].title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Camera className="w-16 h-16 text-gray-600" />
                )}
                {experiences.length > 1 && (
                  <>
                    <button onClick={() => setCarouselIdx(i => (i - 1 + experiences.length) % experiences.length)} aria-label={t('common.previous')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCarouselIdx(i => (i + 1) % experiences.length)} aria-label={t('common.next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-xs text-white">
                  {carouselIdx + 1} / {experiences.length}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-lg font-bold text-white">{experiences[carouselIdx].title}</h4>
                {experiences[carouselIdx].description && (
                  <p className="text-sm text-gray-400 mt-1">{experiences[carouselIdx].description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-astroAccent to-cosmicPurple flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">
                        {experiences[carouselIdx].author?.first_name?.[0]}{experiences[carouselIdx].author?.last_name?.[0]}
                      </span>
                    </div>
                    <span>{experiences[carouselIdx].author?.first_name}</span>
                  </div>
                  <button onClick={() => { setShowCarousel(false); navigate('/map', { state: { selectedZone: experiences[carouselIdx].zone_id } }); }}
                    className="flex items-center gap-1 text-astroAccent hover:text-astroAccent/80 transition-colors ml-auto">
                    <MapPin className="w-3.5 h-3.5" />
                    {t('sanctuaryPanel.viewLocation')}
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-1">{new Date(experiences[carouselIdx].created_at).toLocaleDateString(lang)}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-astroAccent" />
            {t('sanctuaryPanel.coordinates')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">{t('common.latitude')}</p>
              <p className="text-lg font-bold text-white font-mono">
                {zone.latitude != null ? `${Number(zone.latitude).toFixed(4)}°` : '—'}
              </p>
            </div>
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">{t('common.longitude')}</p>
              <p className="text-lg font-bold text-white font-mono">
                {zone.longitude != null ? `${Number(zone.longitude).toFixed(4)}°` : '—'}
              </p>
            </div>
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 col-span-2">
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-astroAccent" />
                <div>
                  <p className="text-xs text-gray-400">{t('sanctuary.altitude')}</p>
                  <p className="text-lg font-bold text-white">{zone.altitude != null ? `${zone.altitude} m` : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {zone.description && (
          <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-1">{t('experiences.description')}</p>
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
