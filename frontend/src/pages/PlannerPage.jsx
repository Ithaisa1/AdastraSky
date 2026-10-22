/**
 * AdastraSky Frontend - Planificador de observación
 * «Quiero observar Saturno este fin de semana cerca de mi ubicación».
 *
 * El cálculo lo hace el ai-service (efemérides reales + previsión de nubes +
 * zonas de AdAstra Sky) a través del backend: POST /api/planner.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Orbit, MapPin, Clock, Moon, Cloud, AlertTriangle, BookOpen, Compass, Navigation, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { API_URL } from '../config/api';

export const TARGETS = ['saturn', 'jupiter', 'mars', 'venus', 'mercury', 'uranus', 'neptune', 'moon', 'm31', 'm42', 'm45', 'm13', 'milky_way_core'];
const WHEN = ['tonight', 'tomorrow', 'weekend', 'week'];
const ISLANDS = ['Tenerife', 'La Palma', 'Gran Canaria', 'Lanzarote', 'Fuerteventura', 'El Hierro', 'La Gomera'];

// Nombre del objetivo que entiende el ai-service (acepta es/en/de)
const TARGET_QUERY = {
  saturn: 'Saturno', jupiter: 'Júpiter', mars: 'Marte', venus: 'Venus', mercury: 'Mercurio', uranus: 'Urano',
  neptune: 'Neptuno', moon: 'Luna', m31: 'M31', m42: 'M42', m45: 'M45', m13: 'M13', milky_way_core: 'Vía Láctea',
};

const confidenceStyle = {
  high: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

// Último plan guardado en el dispositivo: se puede consultar sin cobertura en el mirador
const SAVED_PLAN_KEY = 'adastra.lastPlan';
const readSavedPlan = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_PLAN_KEY));
    return saved?.data?.ok ? saved : null;
  } catch {
    return null;
  }
};

const scoreColor = (s) => (s >= 75 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-orange-500');

export default function PlannerPage() {
  const { t, i18n } = useTranslation();
  const [target, setTarget] = useState('saturn');
  const [when, setWhen] = useState('weekend');
  const [island, setIsland] = useState('');
  // Desde el mapa se llega con ?lat=&lon=&place= (botón «Planificar aquí» de cada mirador)
  const [searchParams] = useSearchParams();
  const [coords, setCoords] = useState(() => {
    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));
    return Number.isFinite(lat) && Number.isFinite(lon) ? { latitude: lat, longitude: lon } : null;
  });
  const [place, setPlace] = useState(() => (coords ? searchParams.get('place') : null));
  const [locating, setLocating] = useState(false);
  const [savedPlan] = useState(readSavedPlan);
  const [result, setResult] = useState(() => savedPlan?.data ?? null);
  const [savedAt, setSavedAt] = useState(() => savedPlan?.at ?? null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locate = () => {
    if (!navigator.geolocation) {
      setError(t('planner.errors.noGeolocation'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: +pos.coords.latitude.toFixed(4), longitude: +pos.coords.longitude.toFixed(4) });
        setPlace(null);
        setIsland('');
        setLocating(false);
      },
      () => {
        setError(t('planner.errors.geolocationDenied'));
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSavedAt(null);
    const inCanaries = coords && coords.latitude > 27 && coords.latitude < 30 && coords.longitude > -19 && coords.longitude < -13;
    try {
      const res = await axios.post(`${API_URL}/api/planner`, {
        target: TARGET_QUERY[target],
        when,
        language: i18n.language,
        ...(inCanaries && coords),
        ...(island && { island }),
      }, { timeout: 70000 });
      setResult(res.data.data);
      if (res.data.data?.ok) {
        try {
          localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify({ at: new Date().toISOString(), data: res.data.data }));
        } catch { /* sin almacenamiento */ }
      }
      if (coords && !inCanaries) setError(t('planner.errors.outsideCanaries'));
    } catch (err) {
      setError(err.response?.status === 429 ? t('planner.errors.rateLimited') : t('planner.errors.generic'));
      const saved = readSavedPlan();
      if (!err.response && saved) {
        setResult(saved.data);
        setSavedAt(saved.at);
      }
    } finally {
      setLoading(false);
    }
  };

  const fmtNight = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Orbit className="w-7 h-7 text-solarFlare" aria-hidden="true" /> {t('planner.title')}
            </h1>
            <p className="text-gray-400 mt-1">{t('planner.subtitle')}</p>
          </header>

          <form onSubmit={submit} className="bg-astroCard border border-white/10 rounded-2xl p-4 sm:p-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="planner-target" className="block text-sm text-gray-300 mb-1">{t('planner.target')}</label>
              <select id="planner-target" value={target} onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2 bg-astroDark/60 border border-white/20 rounded-lg text-white">
                {TARGETS.map((k) => <option key={k} value={k}>{t(`planner.targets.${k}`)}</option>)}
              </select>
            </div>
            <fieldset>
              <legend className="block text-sm text-gray-300 mb-1">{t('planner.when')}</legend>
              <div className="flex flex-wrap gap-2">
                {WHEN.map((w) => (
                  <label key={w} className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${when === w ? 'bg-astroAccent border-astroAccent text-white' : 'border-white/20 text-gray-300 hover:bg-white/5'}`}>
                    <input type="radio" name="when" value={w} checked={when === w} onChange={() => setWhen(w)} className="sr-only" />
                    {t(`planner.whenOptions.${w}`)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="planner-island" className="block text-sm text-gray-300 mb-1">{t('planner.island')}</label>
              <select id="planner-island" value={island} onChange={(e) => { setIsland(e.target.value); if (e.target.value) { setCoords(null); setPlace(null); } }}
                className="w-full px-3 py-2 bg-astroDark/60 border border-white/20 rounded-lg text-white">
                <option value="">{t('planner.anyIsland')}</option>
                {ISLANDS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <span className="block text-sm text-gray-300 mb-1">{t('planner.location')}</span>
              <button type="button" onClick={locate} disabled={locating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-gray-200 hover:bg-white/5 disabled:opacity-50">
                {locating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Navigation className="w-4 h-4" aria-hidden="true" />}
                {coords
                  ? (place ? t('planner.near', { place }) : t('planner.locationSet', { lat: coords.latitude, lon: coords.longitude }))
                  : t('planner.useLocation')}
              </button>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {loading ? t('planner.calculating') : t('planner.submit')}
              </button>
            </div>
          </form>

          <div aria-live="polite" className="mt-6 space-y-4">
            {savedAt && result && (
              <p className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                {t('planner.savedPlan', { date: new Date(savedAt).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }) })}
              </p>
            )}
            {error && (
              <p role="alert" className="flex items-start gap-2 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </p>
            )}

            {result && !result.ok && <p className="text-gray-300">{result.message}</p>}

            {result?.ok && (
              <>
                <p className="text-white font-medium">{result.summary}</p>
                {result.visible && result.recommendations.length === 0 && <p className="text-gray-400">{t('planner.noResults')}</p>}

                <ol className="space-y-4">
                  {result.recommendations.map((r, i) => (
                    <li key={`${r.zone?.name}-${r.night}`} className="bg-astroCard border border-white/10 rounded-2xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">#{i + 1}</p>
                          <h2 className="text-lg font-semibold text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-solarFlare" aria-hidden="true" />
                            {r.zone?.name || t('planner.yourLocation')}
                          </h2>
                          {r.zone && <p className="text-sm text-gray-400">{r.zone.island}{r.zone.altitude ? ` · ${r.zone.altitude} m` : ''}{r.distance_km != null ? ` · ${t('planner.km', { km: r.distance_km })}` : ''}</p>}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${confidenceStyle[r.confidence]}`}>
                            {t(`planner.confidence.${r.confidence}`)}
                          </span>
                          <div className="mt-2 w-32" title={t('planner.scoreHelp')}>
                            <div className="flex justify-between text-xs text-gray-400"><span>{t('planner.score')}</span><span>{r.score}/100</span></div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score} aria-label={t('planner.score')}>
                              <div className={`h-full ${scoreColor(r.score)}`} style={{ width: `${r.score}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-300"><Clock className="w-4 h-4 text-gray-500" aria-hidden="true" /><dt className="sr-only">{t('planner.window')}</dt><dd>{fmtNight(r.night)}<br /><span className="text-white">{r.window_local}</span></dd></div>
                        <div className="flex items-center gap-1.5 text-gray-300"><Compass className="w-4 h-4 text-gray-500" aria-hidden="true" /><dt className="sr-only">{t('planner.maxAltitude')}</dt><dd>{t('planner.altitudeValue', { alt: Math.round(r.max_altitude), dir: r.direction })}</dd></div>
                        <div className="flex items-center gap-1.5 text-gray-300"><Cloud className="w-4 h-4 text-gray-500" aria-hidden="true" /><dt className="sr-only">{t('planner.clouds')}</dt><dd>{r.cloud_cover == null ? t('planner.noForecast') : t('planner.cloudValue', { value: r.cloud_cover })}</dd></div>
                        <div className="flex items-center gap-1.5 text-gray-300"><Moon className="w-4 h-4 text-gray-500" aria-hidden="true" /><dt className="sr-only">{t('planner.moon')}</dt><dd>{t('planner.moonValue', { value: Math.round(r.moon_illumination * 100) })}</dd></div>
                      </dl>

                      <ul className="mt-3 space-y-1 text-sm text-gray-300 list-disc pl-5">
                        {r.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>

                {result.limitations?.length > 0 && (
                  <section className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />{t('planner.limitations')}</h2>
                    <ul className="mt-2 text-sm text-gray-400 list-disc pl-5 space-y-1">
                      {result.limitations.map((l) => <li key={l}>{l}</li>)}
                    </ul>
                  </section>
                )}

                {result.sources?.length > 0 && (
                  <section className="text-xs text-gray-500">
                    <h2 className="flex items-center gap-1 uppercase tracking-wide mb-1"><BookOpen className="w-3 h-3" aria-hidden="true" />{t('chat.sources')}</h2>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1">
                      {result.sources.map((s) => (
                        <li key={s.title}>{s.source?.startsWith('http') ? <a className="underline hover:text-gray-300" href={s.source} target="_blank" rel="noopener noreferrer">{s.title}</a> : s.title}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <p className="text-xs text-gray-500">
                  {t('planner.stellariumHint')}{' '}
                  <a href="https://stellarium-web.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">Stellarium Web</a>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
