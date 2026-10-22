import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import { constellationsData, planetsData } from '../data/astronomicalData';
import { useAstronomyEvents } from '../hooks/useAstronomyEvents';
import { Star, Calendar, MapPin, Sparkles, Moon, Globe, Search, Filter, X, Radar, Loader2 } from 'lucide-react';

// Los valores de temporada/hemisferio del dataset están en español: se traducen para mostrarlos.
const SEASON_KEYS = { Invierno: 'winter', Primavera: 'spring', Verano: 'summer', 'Otoño': 'autumn' };
const HEMI_KEYS = { Norte: 'north', Sur: 'south', Ecuatorial: 'equatorial' };
const PLANET_TYPES = ['terrestrial', 'gas_giant', 'ice_giant', 'moon', 'star'];

const EventIcon = ({ type }) => {
  const Icon = type === 'meteor_shower' ? Sparkles : type === 'eclipse' || type === 'supermoon' ? Moon : type === 'planetary' || type === 'conjunction' ? Globe : Star;
  return <Icon className="w-7 h-7 text-astroAccent" aria-hidden="true" />;
};

const DataPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('constellations');
  const [search, setSearch] = useState('');
  const [filterSeason, setFilterSeason] = useState('all');
  const [filterHemi, setFilterHemi] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const year = new Date().getFullYear();
  const { events, loading: eventsLoading, error: eventsError } = useAstronomyEvents({ year, lang: i18n.language });

  const seasonLabel = (s) => (SEASON_KEYS[s] ? t(`data.seasons.${SEASON_KEYS[s]}`) : s);
  const hemiLabel = (h) => (HEMI_KEYS[h] ? t(`data.hemispheres.${HEMI_KEYS[h]}`) : h);

  const filteredConstellations = useMemo(() => {
    const q = search.toLowerCase();
    return constellationsData.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !c.latin.toLowerCase().includes(q)) return false;
      if (filterSeason !== 'all' && c.season !== filterSeason) return false;
      if (filterHemi !== 'all' && c.hemi !== filterHemi) return false;
      return true;
    });
  }, [search, filterSeason, filterHemi]);

  const filteredPlanets = useMemo(() => {
    if (!search) return planetsData;
    return planetsData.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => !q || e.name.toLowerCase().includes(q));
  }, [search, events]);

  const tabs = [['constellations', t('data.tabs.constellations'), Star], ['planets', t('data.tabs.planets'), Globe], ['events', t('data.tabs.events'), Calendar]];
  const searchPlaceholder = activeTab === 'planets' ? t('data.searchPlanet') : activeTab === 'events' ? t('data.searchEvent') : t('data.searchConstellation');

  const EmptyState = ({ icon: Icon, title, hint }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500" role="status">
      <Icon className="w-16 h-16 mb-4 opacity-50" aria-hidden="true" />
      <p className="text-lg font-medium text-gray-400 mb-1">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
    </div>
  );

  const openOnKey = (item) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItem(item); }
  };

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">{t('data.title')}</h1>
          <p className="text-gray-400 mt-1">{t('data.subtitle', { count: constellationsData.length })}</p>
        </div>

        <div className="bg-astroCard/30 backdrop-blur-lg border-b border-white/10 p-4">
          <div className="flex items-center gap-4 flex-wrap overflow-x-auto">
            <div className="flex gap-2 whitespace-nowrap" role="tablist">
              {tabs.map(([tab, label, Icon]) => (
                <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => { setActiveTab(tab); setSearch(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab ? 'bg-astroAccent text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />{label}
                </button>
              ))}
            </div>
            <div className="flex-1 relative min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <label htmlFor="data-search" className="sr-only">{searchPlaceholder}</label>
              <input id="data-search" type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-astroDark/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-astroAccent/50" />
            </div>
          </div>
        </div>

        {activeTab === 'constellations' && (
          <div className="bg-astroCard/20 border-b border-white/10 p-2 sm:p-3">
            <div className="flex gap-2 sm:gap-3 flex-wrap items-center">
              <Filter className="w-4 h-4 text-gray-500 hidden sm:block" aria-hidden="true" />
              <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)} aria-label={t('data.season')}
                className="bg-astroDark/50 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs text-white max-w-[130px] sm:max-w-none">
                <option value="all">{t('data.allSeasons')}</option>
                {Object.keys(SEASON_KEYS).map(s => <option key={s} value={s}>{seasonLabel(s)}</option>)}
              </select>
              <select value={filterHemi} onChange={e => setFilterHemi(e.target.value)} aria-label={t('data.hemisphere')}
                className="bg-astroDark/50 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs text-white max-w-[130px] sm:max-w-none">
                <option value="all">{t('data.allHemispheres')}</option>
                {Object.keys(HEMI_KEYS).map(h => <option key={h} value={h}>{hemiLabel(h)}</option>)}
              </select>
              <span className="text-xs text-gray-500 whitespace-nowrap" aria-live="polite">{t('data.constellationsCount', { count: filteredConstellations.length })}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'constellations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredConstellations.length === 0 ? (
                <EmptyState icon={Radar} title={t('data.noConstellations')} hint={t('data.tryOtherFilters')} />
              ) : filteredConstellations.map(c => (
                <div key={c.id} role="button" tabIndex={0} onClick={() => setSelectedItem({ type: 'constellation', data: c })}
                  onKeyDown={openOnKey({ type: 'constellation', data: c })}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4 hover:border-astroAccent/50 focus:outline-none focus:border-astroAccent transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{c.name}</h3>
                    <span className="text-xs text-astroAccent bg-astroAccent/20 px-2 py-0.5 rounded-full">{seasonLabel(c.season)}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-1 italic">{c.latin}</p>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{c.mythology}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" aria-hidden="true" /><span>{hemiLabel(c.hemi)}</span>
                    <span className="text-gray-600">|</span>
                    <span>{c.area}°²</span>
                  </div>
                  {c.stars && c.stars.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.stars.slice(0, 3).map((s) => (
                        <span key={s.n} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{s.n}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlanets.length === 0 ? (
                <EmptyState icon={Globe} title={t('data.noPlanets')} hint={t('data.tryOtherSearch')} />
              ) : filteredPlanets.map(p => (
                <div key={p.id} role="button" tabIndex={0} onClick={() => setSelectedItem({ type: 'planet', data: p })}
                  onKeyDown={openOnKey({ type: 'planet', data: p })}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-5 hover:border-astroAccent/50 focus:outline-none focus:border-astroAccent transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      p.type === 'star' ? 'bg-yellow-500/20 text-yellow-400' :
                      p.type === 'gas_giant' ? 'bg-orange-500/20 text-orange-400' :
                      p.type === 'ice_giant' ? 'bg-blue-500/20 text-blue-400' :
                      p.type === 'moon' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-green-500/20 text-green-400'
                    }`} aria-hidden="true">
                      {p.id === 'p8' ? '🌙' : p.id === 'p9' ? '☀️' : p.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-gray-400">{t(`data.planetTypes.${PLANET_TYPES.includes(p.type) ? p.type : 'star'}`)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">{t('data.diameter')}</span><p className="text-white font-medium">{(p.diameter / 1000).toFixed(0)}k km</p></div>
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">{t('data.distanceSun')}</span><p className="text-white font-medium">{p.dist_sun} {t('data.au')}</p></div>
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">{t('data.magnitude')}</span><p className="text-white font-medium">{p.magnitude}</p></div>
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">{t('data.seeWith')}</span><p className="text-white font-medium">{p.visibility}</p></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{p.canarias_view}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4" aria-busy={eventsLoading}>
              {eventsLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-400" role="status">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> {t('common.loading')}
                </div>
              ) : eventsError ? (
                <EmptyState icon={Calendar} title={t('data.eventsError')} />
              ) : filteredEvents.length === 0 ? (
                <EmptyState icon={Calendar} title={t('data.noEvents')} hint={t('data.tryOtherSearch')} />
              ) : filteredEvents.map(event => (
                <div key={event.id} role="button" tabIndex={0} onClick={() => setSelectedItem({ type: 'event', data: event })}
                  onKeyDown={openOnKey({ type: 'event', data: event })}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-5 hover:border-astroAccent/50 focus:outline-none focus:border-astroAccent transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <EventIcon type={event.type} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{event.name}</h3>
                      {event.description && <p className="text-gray-400 text-sm mb-2">{event.description}</p>}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" aria-hidden="true" />{new Date(`${event.date}T12:00:00`).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden="true" />{event.visible_from_canarias === false ? t('data.notVisibleCanaries') : t('data.visibleCanaries')}</span>
                        {event.moon_phase && <span className="flex items-center gap-1"><Moon className="w-3 h-3" aria-hidden="true" />{event.moon_phase}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!eventsLoading && !eventsError && <p className="text-xs text-gray-500">{t('data.eventsSource')}</p>}
            </div>
          )}
        </div>

        {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} t={t} lang={i18n.language} seasonLabel={seasonLabel} hemiLabel={hemiLabel} />}
      </div>
    </div>
  );
};

const Modal = ({ onClose, children, wide }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" className={`bg-astroCard rounded-lg border border-white/10 ${wide ? 'max-w-2xl max-h-[85vh] overflow-auto' : 'max-w-lg'} w-full`} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const CloseButton = ({ onClose, t }) => (
  <button onClick={onClose} aria-label={t('common.close')} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-400" aria-hidden="true" /></button>
);

const DetailModal = ({ item, onClose, t, lang, seasonLabel, hemiLabel }) => {
  if (item.type === 'constellation') {
    const c = item.data;
    return (
      <Modal onClose={onClose} wide>
        <div className="sticky top-0 bg-astroCard/95 border-b border-white/10 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{c.name}</h2>
            <p className="text-gray-500 italic text-sm">{c.latin}</p>
          </div>
          <CloseButton onClose={onClose} t={t} />
        </div>
        <div className="p-4 space-y-4">
          <p className="text-gray-300">{c.mythology}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-astroDark/50 p-3 rounded-lg"><span className="text-xs text-gray-500">{t('data.season')}</span><p className="text-white font-medium">{seasonLabel(c.season)}</p></div>
            <div className="bg-astroDark/50 p-3 rounded-lg"><span className="text-xs text-gray-500">{t('data.hemisphere')}</span><p className="text-white font-medium">{hemiLabel(c.hemi)}</p></div>
            <div className="bg-astroDark/50 p-3 rounded-lg"><span className="text-xs text-gray-500">{t('data.area')}</span><p className="text-white font-medium">{c.area}°²</p></div>
          </div>
          {c.stars && c.stars.length > 0 && (
            <div className="bg-astroDark/50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-astroAccent" aria-hidden="true" />{t('data.mainStars')}</h3>
              <div className="grid grid-cols-1 gap-2">
                {c.stars.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-astroDark/30 px-3 py-2 rounded">
                    <span className="text-white text-sm">{s.n}</span>
                    <span className="text-gray-400 text-xs">mag {s.m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {c.messier && c.messier.length > 0 && (
            <div className="bg-astroDark/50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">{t('data.messier')}</h3>
              <div className="flex flex-wrap gap-2">
                {c.messier.map((m, i) => <span key={i} className="px-2 py-1 bg-astroAccent/20 text-astroAccent text-xs rounded-full">{m}</span>)}
              </div>
            </div>
          )}
          <div className="bg-astroDark/50 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-astroAccent" aria-hidden="true" />{t('data.visibleCanaries')}</h3>
            <p className="text-gray-400 text-sm">{c.visible} · {hemiLabel(c.hemi)}</p>
            <p className="text-sm text-gray-500 mt-1">{c.hemi === 'Norte' ? t('data.visibilityNorth') : c.hemi === 'Sur' ? t('data.visibilitySouth') : t('data.visibilityEquatorial')}</p>
          </div>
        </div>
      </Modal>
    );
  }

  if (item.type === 'planet') {
    const p = item.data;
    return (
      <Modal onClose={onClose}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-astroAccent/20 flex items-center justify-center text-xl" aria-hidden="true">{p.name[0]}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{p.name}</h2>
              <p className="text-gray-400 text-sm">{t(`data.planetTypes.${PLANET_TYPES.includes(p.type) ? p.type : 'star'}`)}</p>
            </div>
          </div>
          <CloseButton onClose={onClose} t={t} />
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.diameter')}</span><p className="text-white">{(p.diameter / 1000).toFixed(0)}k km</p></div>
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.distanceSun')}</span><p className="text-white">{p.dist_sun} {t('data.au')}</p></div>
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.orbit')}</span><p className="text-white">{t('data.days', { count: p.orbital_days, formatted: p.orbital_days.toLocaleString(lang) })}</p></div>
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.magnitude')}</span><p className="text-white">{p.magnitude}</p></div>
            <div className="bg-astroDark/50 p-3 rounded col-span-2"><span className="text-xs text-gray-500">{t('data.bestVisibility')}</span><p className="text-white">{p.visibility}</p></div>
          </div>
          <div className="bg-astroAccent/10 border border-astroAccent/20 rounded-lg p-4">
            <h3 className="text-astroAccent font-medium text-sm mb-1">🌍 {t('data.visibleCanaries')}</h3>
            <p className="text-gray-300 text-sm">{p.canarias_view}</p>
          </div>
        </div>
      </Modal>
    );
  }

  const e = item.data;
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{e.name}</h2>
        <CloseButton onClose={onClose} t={t} />
      </div>
      <div className="p-5 space-y-4">
        {e.description && <p className="text-gray-300">{e.description}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.date')}</span><p className="text-white">{new Date(`${e.date}T12:00:00`).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.timeUtc')}</span><p className="text-white">{e.datetime_utc ? e.datetime_utc.slice(11, 16) : '—'}</p></div>
          <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.visibility')}</span><p className="text-white">{e.visible_from_canarias === false ? t('data.notVisibleCanaries') : t('data.visibleCanaries')}</p></div>
          <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">{t('data.moonPhase')}</span><p className="text-white">{e.moon_phase || '—'}</p></div>
        </div>
      </div>
    </Modal>
  );
};

export default DataPage;
