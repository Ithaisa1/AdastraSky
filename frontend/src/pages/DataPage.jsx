import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import { constellationsData, planetsData, astronomicalEvents } from '../data/astronomicalData';
import { Star, Calendar, MapPin, Sparkles, Moon, Globe, Search, Filter, X, Radar } from 'lucide-react';

const DataPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('constellations');
  const [search, setSearch] = useState('');
  const [filterSeason, setFilterSeason] = useState('all');
  const [filterHemi, setFilterHemi] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const seasons = ['Invierno', 'Primavera', 'Verano', 'Otoño'];
  const hemisferios = ['Norte', 'Sur', 'Ecuatorial'];

  const filteredConstellations = useMemo(() => {
    return constellationsData.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.latin.toLowerCase().includes(search.toLowerCase())) return false;
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
    return astronomicalEvents.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">{t('data.title')}</h1>
          <p className="text-gray-400 mt-1">88 constelaciones, 7 planetas + Luna + Sol, y eventos astronómicos</p>
        </div>

        <div className="bg-astroCard/30 backdrop-blur-lg border-b border-white/10 p-4">
          <div className="flex items-center gap-4 flex-wrap overflow-x-auto">
            <div className="flex gap-2 whitespace-nowrap">
              {[['constellations','Estrellas',Star],['planets','Planetas',Globe],['events','Eventos',Calendar]].map(([tab,label,Icon]) => (
                <button key={tab} onClick={() => { setActiveTab(tab); setSearch(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab===tab ? 'bg-astroAccent text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
            <div className="flex-1 relative min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={activeTab==='planets'?'Buscar planeta...':'Buscar constelación...'}
                className="w-full bg-astroDark/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-astroAccent/50" />
            </div>
          </div>
        </div>

        {activeTab==='constellations' && (
          <div className="bg-astroCard/20 border-b border-white/10 p-2 sm:p-3">
            <div className="flex gap-2 sm:gap-3 flex-wrap items-center">
              <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
              <select value={filterSeason} onChange={e=>setFilterSeason(e.target.value)}
                className="bg-astroDark/50 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs text-white max-w-[130px] sm:max-w-none">
                <option value="all">Todas las temporadas</option>
                {seasons.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterHemi} onChange={e=>setFilterHemi(e.target.value)}
                className="bg-astroDark/50 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs text-white max-w-[130px] sm:max-w-none">
                <option value="all">Todos los hemisferios</option>
                {hemisferios.map(h=><option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-xs text-gray-500 whitespace-nowrap">{filteredConstellations.length} constelaciones</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {activeTab==='constellations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredConstellations.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                  <Radar className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium text-gray-400 mb-1">Ninguna constelación coincide</p>
                  <p className="text-sm">Prueba con otros filtros o cambia la búsqueda</p>
                </div>
              ) : filteredConstellations.map(c => (
                <div key={c.id} onClick={()=>setSelectedItem({type:'constellation',data:c})}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4 hover:border-astroAccent/50 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{c.name}</h3>
                    <span className="text-xs text-astroAccent bg-astroAccent/20 px-2 py-0.5 rounded-full">{c.season}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-1 italic">{c.latin}</p>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{c.mythology}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" /><span>{c.hemi}</span>
                    <span className="text-gray-600">|</span>
                    <span>{c.area}°²</span>
                  </div>
                  {c.stars && c.stars.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.stars.slice(0,3).map((s)=>(
                        <span key={s.n} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{s.n}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab==='planets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlanets.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                  <Globe className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium text-gray-400 mb-1">Ningún planeta coincide</p>
                  <p className="text-sm">Prueba con otro término de búsqueda</p>
                </div>
              ) : filteredPlanets.map(p => (
                <div key={p.id} onClick={()=>setSelectedItem({type:'planet',data:p})}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-5 hover:border-astroAccent/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      p.type==='star' ? 'bg-yellow-500/20 text-yellow-400' :
                      p.type==='gas_giant' ? 'bg-orange-500/20 text-orange-400' :
                      p.type==='ice_giant' ? 'bg-blue-500/20 text-blue-400' :
                      p.type==='moon' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {p.id==='p8' ? '🌙' : p.id==='p9' ? '☀️' : p.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-gray-400">{p.type==='terrestrial'?'Terrestre':p.type==='gas_giant'?'Gigante gaseoso':p.type==='ice_giant'?'Gigante helado':p.type==='moon'?'Satélite':'Estrella'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">Diámetro</span><p className="text-white font-medium">{(p.diameter/1000).toFixed(0)}k km</p></div>
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">Distancia Sol</span><p className="text-white font-medium">{p.dist_sun} UA</p></div>
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">Magnitud</span><p className="text-white font-medium">{p.magnitude}</p></div>
                    <div className="bg-astroDark/50 p-2 rounded"><span className="text-gray-500">Ver con</span><p className="text-white font-medium">{p.visibility}</p></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{p.canarias_view}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab==='events' && (
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Calendar className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium text-gray-400 mb-1">Ningún evento coincide</p>
                  <p className="text-sm">Prueba con otro término de búsqueda</p>
                </div>
              ) : filteredEvents.map(event => (
                <div key={event.id} onClick={()=>setSelectedItem({type:'event',data:event})}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-5 hover:border-astroAccent/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {event.type==='meteor_shower' && <Sparkles className="w-7 h-7 text-astroAccent" />}
                      {event.type==='eclipse' && <Moon className="w-7 h-7 text-astroAccent" />}
                      {event.type==='comet' && <Star className="w-7 h-7 text-astroAccent" />}
                      {event.type==='planetary' && <Globe className="w-7 h-7 text-astroAccent" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{event.name}</h3>
                        <span className="px-2 py-0.5 bg-astroAccent/20 text-astroAccent text-xs rounded-full">{event.peak}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{event.desc}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.hemi}</span>
                        <span className="flex items-center gap-1"><Moon className="w-3 h-3" />Luna {event.moon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {selectedItem && <DetailModal item={selectedItem} onClose={()=>setSelectedItem(null)} />}
    </div>
    </div>
  );
};

const DetailModal = ({ item, onClose }) => {
  if (item.type === 'constellation') {
    const c = item.data;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <div className="bg-astroCard rounded-lg border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-auto" onClick={e=>e.stopPropagation()}>
          <div className="sticky top-0 bg-astroCard/95 border-b border-white/10 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{c.name}</h2>
              <p className="text-gray-500 italic text-sm">{c.latin}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-gray-300">{c.mythology}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-astroDark/50 p-3 rounded-lg"><span className="text-xs text-gray-500">Temporada</span><p className="text-white font-medium">{c.season}</p></div>
              <div className="bg-astroDark/50 p-3 rounded-lg"><span className="text-xs text-gray-500">Hemisferio</span><p className="text-white font-medium">{c.hemi}</p></div>
              <div className="bg-astroDark/50 p-3 rounded-lg"><span className="text-xs text-gray-500">Área</span><p className="text-white font-medium">{c.area}°²</p></div>
            </div>
            {c.stars && c.stars.length > 0 && (
              <div className="bg-astroDark/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-astroAccent" />Estrellas principales</h4>
                <div className="grid grid-cols-1 gap-2">
                  {c.stars.map((s,i) => (
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
                <h4 className="text-white font-medium mb-2">Objetos Messier</h4>
                <div className="flex flex-wrap gap-2">
                  {c.messier.map((m,i) => <span key={i} className="px-2 py-1 bg-astroAccent/20 text-astroAccent text-xs rounded-full">{m}</span>)}
                </div>
              </div>
            )}
            <div className="bg-astroDark/50 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-astroAccent" />Visible desde Canarias</h4>
              <p className="text-gray-400 text-sm">{c.visible} · Hemisferio {c.hemi}</p>
              <p className="text-sm text-gray-500 mt-1">{c.hemi==='Norte'?'Excelente visibilidad desde las Islas Canarias':c.hemi==='Sur'?'Parcialmente visible cerca del horizonte sur':'Visible en distintas épocas'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'planet') {
    const p = item.data;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <div className="bg-astroCard rounded-lg border border-white/10 max-w-lg w-full" onClick={e=>e.stopPropagation()}>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-astroAccent/20 flex items-center justify-center text-xl">{p.name[0]}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{p.name}</h2>
                <p className="text-gray-400 text-sm">{p.type==='terrestrial'?'Planeta terrestre':p.type==='gas_giant'?'Gigante gaseoso':p.type==='ice_giant'?'Gigante helado':p.type==='moon'?'Satélite natural':'Estrella'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Diámetro</span><p className="text-white">{(p.diameter/1000).toFixed(0)}k km</p></div>
              <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Distancia Sol</span><p className="text-white">{p.dist_sun} UA</p></div>
              <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Órbita</span><p className="text-white">{p.orbital_days.toLocaleString()} días</p></div>
              <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Magnitud</span><p className="text-white">{p.magnitude}</p></div>
              <div className="bg-astroDark/50 p-3 rounded col-span-2"><span className="text-xs text-gray-500">Mejor visibilidad</span><p className="text-white">{p.visibility}</p></div>
            </div>
            <div className="bg-astroAccent/10 border border-astroAccent/20 rounded-lg p-4">
              <h4 className="text-astroAccent font-medium text-sm mb-1">🌍 Visible desde Canarias</h4>
              <p className="text-gray-300 text-sm">{p.canarias_view}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const e = item.data;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-astroCard rounded-lg border border-white/10 max-w-lg w-full" onClick={e=>e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{e.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-gray-300">{e.desc}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Fecha</span><p className="text-white">{e.date}</p></div>
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Pico</span><p className="text-white">{e.peak}</p></div>
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Visibilidad</span><p className="text-white">{e.hemi}</p></div>
            <div className="bg-astroDark/50 p-3 rounded"><span className="text-xs text-gray-500">Fase lunar</span><p className="text-white">{e.moon}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;
