/**
 * AdastraSky Frontend - Panel Lateral de Ficha Técnica
 * Santuario View con información detallada del mirador y consumo asíncrono de OpenWeather API
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { X, Thermometer, Cloud, Wind, Eye, Droplets, Mountain, MapPin, Video, BadgeCheck } from 'lucide-react';

const SanctuaryPanel = ({ zone, onClose }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // Consumo asíncrono de OpenWeather API
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoadingWeather(true);
      
      try {
        if (API_KEY && zone.latitude && zone.longitude) {
          const response = await axios.get(OPENWEATHER_URL, {
            params: {
              lat: zone.latitude,
              lon: zone.longitude,
              appid: API_KEY,
              units: 'metric',
              lang: language,
            },
          });

          const data = response.data;
          setWeatherData({
            temperature: Math.round(data.main.temp),
            cloudiness: data.clouds.all,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convertir m/s a km/h
            windDirection: getWindDirection(data.wind.deg),
            visibility: Math.round(data.visibility / 1000), // Convertir m a km
            humidity: data.main.humidity,
          });
        } else {
          // Fallback con datos simulados
          setWeatherData({
            temperature: 18,
            cloudiness: 15,
            windSpeed: 12,
            windDirection: 'NE',
            visibility: 25,
            humidity: 45,
          });
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        // Fallback con datos simulados en caso de error
        setWeatherData({
          temperature: 18,
          cloudiness: 15,
          windSpeed: 12,
          windDirection: 'NE',
          visibility: 25,
          humidity: 45,
        });
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeatherData();
  }, [zone.latitude, zone.longitude, language, API_KEY]);

  // Función auxiliar para convertir grados a dirección del viento
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Datos simulados de calidad del cielo (en producción vendrían de la API)
  const skyQuality = {
    seeing: '1.2 arcsec',
    lightPollution: 'Baja',
    bortleLevel: zone.bortle_scale,
  };

  // Fuentes simuladas del RAG (en producción vendrían del agente de IA)
  const ragSources = [
    'Ley del Cielo IAC',
    'Reserva Starlight Fuerteventura',
    'Guía de Observación Canarias',
  ];

  // Categoría en español
  const categoryNames = {
    observatory: 'Observatorio Astronómico',
    astronomical_viewpoint: 'Mirador Astronómico',
    landscape_viewpoint: 'Mirador Paisajístico',
  };

  return (
    <div className="h-full overflow-y-auto bg-astroCard">
      {/* Header con botón de cerrar */}
      <div className="sticky top-0 bg-astroCard/95 backdrop-blur-lg border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* Selector de idioma local */}
          <div className="flex gap-1">
            {['es', 'en', 'de'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  language === lang
                    ? 'bg-astroAccent text-white'
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Encabezado de ubicación */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{zone.name}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{zone.island}</span>
          </div>
          <span className="inline-block px-3 py-1 bg-astroAccent/20 text-astroAccent text-xs font-medium rounded-full border border-astroAccent/30">
            {categoryNames[zone.category] || zone.category}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Sección Multimedia */}
        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <img
            src={`https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop`}
            alt={zone.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 bg-astroAccent/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" />
            {t('sanctuary.realImage')}
          </div>
        </div>

        {/* Módulo de Meteorología */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-astroAccent" />
            {t('sanctuary.weather')}
          </h3>
          
          {isLoadingWeather ? (
            // Skeleton Loader mientras se cargan los datos meteorológicos
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 animate-pulse">
                <div className="h-4 bg-astroAccent/30 rounded mb-2 w-20" />
                <div className="h-6 bg-white/20 rounded w-12" />
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 animate-pulse">
                <div className="h-4 bg-astroAccent/30 rounded mb-2 w-16" />
                <div className="h-6 bg-white/20 rounded w-12" />
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 animate-pulse">
                <div className="h-4 bg-astroAccent/30 rounded mb-2 w-12" />
                <div className="h-6 bg-white/20 rounded w-12" />
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 animate-pulse">
                <div className="h-4 bg-astroAccent/30 rounded mb-2 w-14" />
                <div className="h-6 bg-white/20 rounded w-12" />
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 col-span-2 animate-pulse">
                <div className="h-4 bg-astroAccent/30 rounded mb-2 w-16" />
                <div className="h-6 bg-white/20 rounded w-12" />
              </div>
            </div>
          ) : (
            // Datos meteorológicos cargados
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Thermometer className="w-3 h-3" />
                  {t('sanctuary.temperature')}
                </div>
                <p className="text-xl font-bold text-white">{weatherData.temperature}°C</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Cloud className="w-3 h-3" />
                  {t('sanctuary.cloudiness')}
                </div>
                <p className="text-xl font-bold text-white">{weatherData.cloudiness}%</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Wind className="w-3 h-3" />
                  {t('sanctuary.wind')}
                </div>
                <p className="text-xl font-bold text-white">{weatherData.windSpeed} km/h</p>
                <p className="text-xs text-gray-500">{weatherData.windDirection}</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Eye className="w-3 h-3" />
                  {t('sanctuary.visibility')}
                </div>
                <p className="text-xl font-bold text-white">{weatherData.visibility} km</p>
              </div>
              <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 col-span-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Droplets className="w-3 h-3" />
                  {t('sanctuary.humidity')}
                </div>
                <p className="text-xl font-bold text-white">{weatherData.humidity}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Calidad del Cielo */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-astroAccent" />
            {t('sanctuary.skyQuality')}
          </h3>
          
          {/* Escala Bortle */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>1 (Excelente)</span>
              <span>9 (Urbano)</span>
            </div>
            <div className="relative h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-600">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-astroAccent shadow-lg shadow-astroAccent/50"
                style={{ left: `${((zone.bortle_scale - 1) / 8) * 100}%` }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold text-astroAccent">
                Bortle {zone.bortle_scale}
              </span>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Seeing</p>
              <p className="text-lg font-bold text-white">{skyQuality.seeing}</p>
            </div>
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">{t('sanctuary.lightPollution')}</p>
              <p className="text-lg font-bold text-white">{skyQuality.lightPollution}</p>
            </div>
          </div>
        </div>

        {/* Módulo de Streaming / Datos de Interés */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Video className="w-5 h-5 text-astroAccent" />
            Datos de Interés
          </h3>
          
          <div className="space-y-3">
            {/* Streaming simulado */}
            {zone.category === 'observatory' && (
              <div className="bg-astroDark/50 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">{t('sanctuary.live')}</span>
                </div>
                <div className="aspect-video bg-astroDark rounded-lg flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-600" />
                </div>
              </div>
            )}

            {/* Altitud */}
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10 flex items-center gap-3">
              <Mountain className="w-5 h-5 text-astroAccent" />
              <div>
                <p className="text-xs text-gray-400">{t('sanctuary.altitude')}</p>
                <p className="text-lg font-bold text-white">{zone.altitude} m</p>
              </div>
            </div>

            {/* Accesibilidad */}
            <div className="bg-astroDark/50 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">{t('sanctuary.accessibility')}</p>
              <p className="text-sm text-white">
                Accesible en vehículo hasta 500m, luego caminata moderada
              </p>
            </div>
          </div>
        </div>

        {/* Pie de Citas RAG */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">{t('sanctuary.sources')}</h3>
          <div className="flex flex-wrap gap-2">
            {ragSources.map((source, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-astroAccent/20 text-astroAccent text-xs rounded-full border border-astroAccent/30"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanctuaryPanel;
