import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Globe, Moon, Star, Sparkles, Map, Sun
} from 'lucide-react';
import {
  getLunarPhase, calculateSkyScore, getNextEvent, getGreeting
} from '../utils/astronomy';
import { santuariosData } from '../data/santuariosData';
import { astronomicalEvents } from '../data/astronomicalData';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'https://aadastra-sky-backend.onrender.com';

const DashboardPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lang = i18n.language;
  const [liveScore, setLiveScore] = useState(null);

  const lunar = useMemo(() => getLunarPhase(), []);
  const localScore = useMemo(() => calculateSkyScore(santuariosData), []);
  const greeting = getGreeting(lang);

  useEffect(() => {
    fetch(`${API_URL}/api/sky/score/latest`)
      .then(r => r.json())
      .then(data => {
        if (data?.data?.score?.source !== 'fallback') {
          setLiveScore(data.data.score);
        }
      })
      .catch(() => {});
  }, []);

  const skyScore = liveScore
    ? { score: liveScore.overall_score, level: '', label: '' }
    : localScore;

  const topZones = useMemo(() =>
    [...santuariosData]
      .sort((a, b) => a.bortle_scale - b.bortle_scale)
      .slice(0, 3),
  []);

  const featuredIsland = useMemo(() => {
    const islands = [...new Set(santuariosData.map(z => z.island))];
    return islands[Math.floor(Math.random() * islands.length)];
  }, []);

  const nextEvent = getNextEvent(astronomicalEvents);

  const gaugeCircumference = 283;
  const gaugeOffset = gaugeCircumference - (skyScore.score / 10) * gaugeCircumference;

  return (
    <div className="h-screen w-full flex bg-deepSpace overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-gradient-dashboard p-3 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

          {/* HERO SECTION */}
          <section className="relative rounded-2xl overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-astroDark/90 via-astroDark/60 to-transparent z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center animate-ken-burns"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop)',
              }}
            />
            <div className="relative z-20 p-6 sm:p-8 md:p-12">
              <div className="flex items-center gap-2 text-auroraGreen mb-2">
                <Sparkles className="w-4 h-4 text-auroraGreen" />
                <span className="text-xs font-mono uppercase tracking-widest text-auroraGreen/90">
                  {new Date().toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2">
                {greeting}, {user?.first_name || 'Explorador'}
              </h1>
              <p className="text-sm sm:text-lg text-gray-300 max-w-xl">
                {lang === 'es' ? 'Hoy el archipiélago te ofrece' :
                 lang === 'en' ? 'Today the archipelago offers you' :
                 'Heute bietet dir der Archipel'}{' '}
                <span className="text-solarFlare font-semibold [text-shadow:0_0_20px_rgba(245,158,11,0.4)]">{santuariosData.length} santuarios estelares</span>{' '}
                {lang === 'es' ? 'para explorar' :
                 lang === 'en' ? 'to explore' :
                 'zu erkunden'}
              </p>
            
            </div>
          </section>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">

            {/* LUNAR PHASE */}
            <div className="bg-gradient-card rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Moon className="w-4 h-4 text-astroAccent" />
                  {lang === 'es' ? 'Fase Lunar' : lang === 'en' ? 'Lunar Phase' : 'Mondphase'}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-float">{lunar.emoji}</div>
                <div>
                  <p className="text-2xl font-bold text-white">{lunar.name[lang]?.[lunar.phaseIndex] || lunar.name.es[lunar.phaseIndex]}</p>
                  <p className="text-sm text-gray-400">
                    <span className="text-auroraGreen font-semibold">{lunar.illumination}%</span>{' '}
                    {lang === 'es' ? 'iluminado' : lang === 'en' ? 'illuminated' : 'beleuchtet'}
                  </p>
                </div>
              </div>
            </div>

            {/* SKY SCORE GAUGE */}
            <div className="bg-gradient-card rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-astroAccent" />
                {lang === 'es' ? 'Sky Score Global' : lang === 'en' ? 'Global Sky Score' : 'Globaler Himmelswert'}
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative w-20 sm:w-24 h-20 sm:h-24">
                  <svg className="w-20 sm:w-24 h-20 sm:h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke={
                        skyScore.score >= 8 ? '#10B981' :
                        skyScore.score >= 6 ? '#4F46E5' :
                        skyScore.score >= 4 ? '#F59E0B' :
                        '#EF4444'
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                      style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-white">{skyScore.score.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-white">{skyScore.label}</p>
                  <p className="text-xs text-gray-400">
                    {liveScore
                      ? (lang === 'es' ? 'Actualizado hoy' : lang === 'en' ? 'Updated today' : 'Heute aktualisiert')
                      : (lang === 'es' ? 'Media del archipiélago' :
                         lang === 'en' ? 'Archipelago average' :
                         'Durchschnitt der Inseln')}
                  </p>
                  {liveScore && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono text-auroraGreen bg-auroraGreen/10 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-auroraGreen animate-pulse" />
                      EN VIVO
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* NEXT EVENT */}
            <div className="bg-gradient-card rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-solarFlare" />
                {lang === 'es' ? 'Próximo Evento' : lang === 'en' ? 'Next Event' : 'Nächstes Ereignis'}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-solarFlare/10 border border-solarFlare/20 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-solarFlare" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white truncate">{nextEvent.name || 'Próximo Evento'}</p>
                  <p className="text-sm text-gray-400">
                    {(() => {
                      const d = new Date(nextEvent.date);
                      return isNaN(d.getTime())
                        ? (lang === 'es' ? 'Agosto 2026' : 'August 2026')
                        : d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TOP SANCTUARIES */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-astroAccent" />
                {lang === 'es' ? 'Mejores Santuarios Hoy' :
                 lang === 'en' ? 'Best Sanctuaries Today' :
                 'Beste Heiligtümer Heute'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {topZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => navigate('/map', { state: { selectedZone: zone } })}
                  className="group bg-gradient-card rounded-xl border border-white/5 p-5 text-left hover:border-astroAccent/30 transition-all duration-300 hover:shadow-lg hover:shadow-astroAccent/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-cosmicPurple/20 text-nebulaPink border border-cosmicPurple/30 shadow-[0_0_12px_rgba(236,72,153,0.15)]">
                      Bortle {zone.bortle_scale}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      zone.bortle_scale <= 2 ? 'bg-auroraGreen animate-pulse' :
                      zone.bortle_scale <= 4 ? 'bg-solarFlare' : 'bg-red-500'
                    }`} />
                  </div>
                  <h3 className="text-white font-semibold group-hover:text-astroAccent transition-colors">{zone.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{zone.island}</p>
                  <div className="flex gap-3 mt-3 text-xs">
                    <span className="text-emerald-300 font-mono font-semibold">{zone.altitude}m</span>
                    <span className="capitalize text-indigo-300">
                      {zone.category === 'observatory' ? '🔭' :
                       zone.category === 'astronomical_viewpoint' ? '🌌' : '🏞️'}
                      {' '}
                      {zone.category === 'observatory'
                        ? (lang === 'es' ? 'Observatorio' : lang === 'en' ? 'Observatory' : 'Observatorium')
                        : zone.category === 'astronomical_viewpoint'
                        ? (lang === 'es' ? 'Mirador Astro' : lang === 'en' ? 'Astro Viewpoint' : 'Astro-Aussicht')
                        : (lang === 'es' ? 'Paisajístico' : lang === 'en' ? 'Landscape' : 'Landschaft')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            {/* FEATURED ISLAND */}
            <div className="relative rounded-2xl overflow-hidden border border-white/5 group cursor-pointer"
                 onClick={() => navigate('/explorador')}>
              <div className="absolute inset-0 bg-gradient-to-r from-astroDark/80 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 animate-ken-burns"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1587936571907-f205f0a22db3?q=80&w=2070&auto=format&fit=crop)',
                }}
              />
              <div className="relative z-20 p-8">
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                  {lang === 'es' ? 'Isla Destacada' : lang === 'en' ? 'Featured Island' : 'Vorgestellte Insel'}
                </p>
                <h3 className="text-3xl font-bold text-white mb-2">{featuredIsland}</h3>
                <p className="text-sm text-gray-300 max-w-xs">
                  <span className="text-solarFlare font-semibold">{santuariosData.filter(z => z.island === featuredIsland).length}</span>
                  {' '}{lang === 'es'
                    ? 'santuarios estelares te esperan'
                    : lang === 'en'
                    ? 'stellar sanctuaries await you'
                    : 'Sternenheiligtümer warten auf dich'}
                </p>
              </div>
            </div>

            {/* EXPLORE MAP CTA */}
            <div className="bg-gradient-card rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-astroAccent/20 to-cosmicPurple/20 border border-astroAccent/20 flex items-center justify-center mb-4 animate-glow-pulse">
                <Map className="w-8 h-8 text-astroAccent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {lang === 'es' ? 'Mapa Interactivo' : lang === 'en' ? 'Interactive Map' : 'Interaktive Karte'}
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                {lang === 'es'
                  ? 'Explora los 75 puntos de interés repartidos por las 8 islas del archipiélago'
                  : lang === 'en'
                  ? 'Explore all 75 points of interest across the 8 islands of the archipelago'
                  : 'Erkunden Sie alle 75 Sehenswürdigkeiten auf den 8 Inseln des Archipels'}
              </p>
              <button
                onClick={() => navigate('/map')}
                className="flex items-center gap-2 px-8 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl transition-all duration-300 shadow-lg shadow-astroAccent/30"
              >
                <Globe className="w-4 h-4" />
                <span>{lang === 'es' ? 'Abrir Mapa' : lang === 'en' ? 'Open Map' : 'Karte Öffnen'}</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
