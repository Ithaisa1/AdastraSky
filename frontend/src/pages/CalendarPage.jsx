import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Moon, Globe, Star, ExternalLink, Clock, MapPin, Image, SatelliteDish, BookOpen } from 'lucide-react';
import teideImg from '../assets/observatorio-teide.jpg';
import roqueImg from '../assets/Observacion_estrellas_roque_muchachos_isla_bonita_tours.jpg';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const EVENT_ICONS = { meteor_shower: Sparkles, eclipse: Moon, comet: Star, planetary: Globe, conjunction: Star, supermoon: Moon, other: Calendar };

const EVENT_COLORS = { meteor_shower: 'text-yellow-400 bg-yellow-400/20', eclipse: 'text-purple-400 bg-purple-400/20', comet: 'text-cyan-400 bg-cyan-400/20', planetary: 'text-orange-400 bg-orange-400/20', conjunction: 'text-pink-400 bg-pink-400/20', supermoon: 'text-blue-400 bg-blue-400/20', other: 'text-gray-400 bg-gray-400/20' };

const OBSERVATORIES = [
  {
    name: 'Observatorio del Teide',
    island: 'Tenerife',
    altitude: '2.390 m',
    bortle: 2,
    image: teideImg,
    website: 'https://www.iac.es/es/observatorios-de-canarias/observatorio-del-teide/visitas',
    bookingUrl: 'https://www.iac.es/es/observatorios-de-canarias/observatorio-del-teide/visitas',
    info: 'Gestionado por el Instituto de Astrofísica de Canarias (IAC). Visitas guiadas durante todo el año (excepto diciembre a marzo por condiciones meteorológicas).',
    details: [
      'Visitas para particulares, grupos y centros escolares',
      'Jornadas de Puertas Abiertas: 20-21 junio 2026',
      'Entrada gratuita para menores de 16 años',
      'Descuento para residentes canarios',
      'Contacto: +34 922 329 100 / teide-ot@iac.es',
    ]
  },
  {
    name: 'Observatorio Roque de los Muchachos',
    island: 'La Palma',
    altitude: '2.396 m',
    bortle: 1,
    image: roqueImg,
    website: 'https://www.iac.es/es/observatorios-de-canarias/observatorio-del-roque-de-los-muchachos/visitas',
    bookingUrl: 'https://fundacionstarlight.org/',
    alternativeBooking: 'https://asterark.com/visit-the-observatories/?lang=en',
    altLabel: 'Reservar con AsterArk (Guía Starlight)',
    info: 'Gestionado por el IAC. Las reservas se realizan a través de la Fundación Starlight con guías especializados "Guías Starlight".',
    details: [
      'Visitas para particulares (con Guía Starlight)',
      'Visitas para centros sociales y educativos',
      'Acceso por carretera de montaña (40 km desde Santa Cruz)',
      'Importante: llevar resguardo de reserva',
      'Contacto: visitasorm@iac.es',
    ]
  }
];

function CalendarGrid({ events, month, year, onPrevMonth, onNextMonth, onEventClick }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventDates = {};
  events.forEach(ev => {
    const d = ev.date?.split('T')[0] || ev.date;
    if (!eventDates[d]) eventDates[d] = [];
    eventDates[d].push(ev);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <div className="bg-astroCard/50 backdrop-blur-lg rounded-xl border border-white/10 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onPrevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">{MONTHS[month]} {year}</h2>
        <button onClick={onNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">{d}</div>
        ))}
        {rows.map((row, ri) =>
          row.map((day, ci) => {
            if (day === null) return <div key={`e-${ri}-${ci}`} className="min-h-[50px] sm:min-h-[60px] md:min-h-[80px]" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventDates[dateStr] || [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            return (
              <div key={`d-${ri}-${ci}`} className={`min-h-[50px] sm:min-h-[60px] md:min-h-[80px] p-1 rounded-lg border ${isToday ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-transparent hover:border-white/10 hover:bg-white/5'} transition-all`}>
                <div className={`text-[11px] sm:text-xs md:text-sm font-medium mb-0.5 sm:mb-1 ${isToday ? 'text-cyan-400' : 'text-gray-400'}`}>{day}</div>
                <div className="flex flex-col gap-px sm:gap-0.5">
                  {dayEvents.slice(0, 2).map((ev, i) => {
                    const Icon = EVENT_ICONS[ev.type] || Calendar;
                    const colorClass = EVENT_COLORS[ev.type] || EVENT_COLORS.other;
                    return (
                      <button key={i} onClick={() => onEventClick(ev)}
                        className={`flex items-center gap-1 px-1 py-px sm:py-0.5 rounded text-[9px] sm:text-[10px] md:text-xs ${colorClass} truncate hover:opacity-80`}
                      >
                        <Icon className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                        <span className="truncate hidden md:inline">{ev.name}</span>
                      </button>
                    );
                  })}
                  {dayEvents.length > 2 && <div className="text-[9px] sm:text-[10px] text-gray-500 px-1">+{dayEvents.length - 2} más</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EventList({ events, onEventClick }) {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <div className="bg-astroCard/30 rounded-xl border border-white/10 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">{t('calendar.noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => {
        const Icon = EVENT_ICONS[ev.type] || Calendar;
        const colorClass = EVENT_COLORS[ev.type] || EVENT_COLORS.other;
        const d = ev.date?.split('T')[0] || ev.date;
        return (
          <div key={ev.id} onClick={() => onEventClick(ev)}
            className="bg-astroCard/30 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:border-cyan-400/50 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{ev.name}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{ev.description?.slice(0, 100)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white text-sm font-medium">{new Date(d + 'T12:00:00').getDate()}</div>
                <div className="text-gray-500 text-xs">{MONTHS[new Date(d + 'T12:00:00').getMonth()].slice(0, 3)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ObservatoryCard({ obs }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-gradient-to-br from-astroCard/80 to-astroCard/40 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-cyan-400/30 transition-all">
      <div className="h-36 relative overflow-hidden">
        <img src={obs.image} alt={obs.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded-lg text-xs font-mono text-cyan-400 z-10">
          Bortle {obs.bortle}
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <div className="text-lg font-bold text-white drop-shadow-lg">{obs.name}</div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg">{obs.name}</h3>
        <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 mb-3">
          <MapPin className="w-3 h-3" /> {obs.island} · {obs.altitude}
        </div>
        <p className="text-gray-400 text-sm mb-3">{obs.info}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <a href={obs.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium transition-all"
          >
            <BookOpen className="w-4 h-4" /> {t('reservas.bookVisit')} <ExternalLink className="w-3 h-3" />
          </a>
          <a href={obs.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-all"
          >
            <ExternalLink className="w-3 h-3" /> {t('reservas.officialWeb')}
          </a>
          {obs.alternativeBooking && (
            <a href={obs.alternativeBooking} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-sm font-medium transition-all"
            >
              <Star className="w-3 h-3" /> {obs.altLabel}
            </a>
          )}
        </div>

        <button onClick={() => setExpanded(!expanded)} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
          {expanded ? `▼ ${t('reservas.lessInfo')}` : `▶ ${t('reservas.moreInfo')}`}
        </button>

        {expanded && (
          <ul className="mt-3 space-y-1.5">
            {obs.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-400 text-xs">
                <span className="text-cyan-400 mt-0.5">•</span> {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ApodGallery() {
  const { t } = useTranslation();
  const [apods, setApods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/events/nasa/apod`)
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data) && d.data.length > 0) setApods(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 text-sm">{t('common.loading')}</div>;

  const items = apods.length > 0
    ? apods.filter(a => a.media_type === 'image').slice(0, 4).map(a => ({ title: a.title, subtitle: a.date, url: a.hdurl || a.url, img: a.url }))
    : [
        { title: 'Observatorio del Teide', subtitle: 'Tenerife · IAC', url: 'https://www.iac.es', img: teideImg },
        { title: 'Observatorio Roque de los Muchachos', subtitle: 'La Palma · IAC', url: 'https://www.iac.es', img: roqueImg },
      ];

  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Image className="w-5 h-5 text-cyan-400" /> {t('calendar.apodTitle')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            className="group relative bg-astroCard/30 rounded-xl border border-white/10 overflow-hidden hover:border-cyan-400/30 transition-all"
          >
            <div className="h-40 overflow-hidden">
              <img src={item.img} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="p-3">
              <h4 className="text-white text-sm font-medium truncate">{item.title}</h4>
              <p className="text-gray-500 text-xs mt-1">{item.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('calendar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setEvents([]);
    fetch(`${API}/api/events?month=${month + 1}&year=${year}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { if (d.success) setEvents(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [month, year]);

  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleGoToday = () => {
    const now = new Date();
    setMonth(now.getMonth());
    setYear(now.getFullYear());
  };

  const tabs = [
    { id: 'calendar', label: t('calendar.tabCalendar'), icon: Calendar },
    { id: 'reservas', label: t('calendar.tabReservas'), icon: SatelliteDish },
  ];

  return (
    <div className="min-h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col p-3 overflow-auto">
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-4 md:p-6 rounded-xl mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t('calendar.title')}</h1>
              <p className="text-gray-400 text-sm mt-1">{t('calendar.subtitle')}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'}`}
                  >
                    <Icon className="w-4 h-4" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {tab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative">
              {loading && (
                <div className="absolute inset-0 bg-astroDark/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                  <div className="text-cyan-400 text-sm font-mono animate-pulse">{t('calendar.loading')}</div>
                </div>
              )}
              <CalendarGrid
                events={events} month={month} year={year}
                onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
                onEventClick={setSelectedEvent}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{t('calendar.eventsIn')} {MONTHS[month]}</h3>
                <button onClick={handleGoToday} className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-cyan-500/10 rounded-lg">{t('calendar.today')}</button>
              </div>
              {loading ? (
                <div className="text-gray-500 text-sm animate-pulse py-8 text-center">{t('calendar.loading')}</div>
              ) : (
                <EventList events={events} onEventClick={setSelectedEvent} />
              )}
            </div>
          </div>
        )}

        {tab === 'reservas' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-xl border border-cyan-500/20 p-4 md:p-6">
              <h2 className="text-xl font-bold text-white mb-2">{t('reservas.title')}</h2>
              <p className="text-gray-400 text-sm">{t('reservas.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OBSERVATORIES.map((obs, i) => (
                <ObservatoryCard key={i} obs={obs} />
              ))}
            </div>
            <div className="bg-astroCard/30 rounded-xl border border-white/10 p-4 md:p-6">
              <h3 className="text-white font-bold text-lg mb-3">{t('reservas.importantTitle')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span> {t('reservas.suspended')}</li>
                <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span> {t('reservas.accessTeide')}</li>
                <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span> {t('reservas.accessORM')}</li>
                <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span> {t('reservas.jppaa')}</li>
              </ul>
            </div>

            <ApodGallery />
          </div>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-astroCard rounded-xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(() => { const Icon = EVENT_ICONS[selectedEvent.type] || Calendar; const cc = EVENT_COLORS[selectedEvent.type] || EVENT_COLORS.other; return <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cc}`}><Icon className="w-5 h-5" /></div>; })()}
                    <h2 className="text-xl font-bold text-white">{selectedEvent.name}</h2>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">✕</button>
                </div>
                <p className="text-gray-300 text-sm mb-4">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selectedEvent.peak && (
                    <div className="bg-astroDark/50 rounded-lg p-3"><p className="text-gray-500 text-xs">Pico</p><p className="text-white text-sm font-medium">{selectedEvent.peak}</p></div>
                  )}
                  <div className="bg-astroDark/50 rounded-lg p-3"><p className="text-gray-500 text-xs">Hemisfério</p><p className="text-white text-sm font-medium">{selectedEvent.hemisphere}</p></div>
                  {selectedEvent.moon_phase && (
                    <div className="bg-astroDark/50 rounded-lg p-3"><p className="text-gray-500 text-xs">Fase lunar</p><p className="text-white text-sm font-medium">{selectedEvent.moon_phase}</p></div>
                  )}
                  <div className="bg-astroDark/50 rounded-lg p-3"><p className="text-gray-500 text-xs">Fecha</p><p className="text-white text-sm font-medium">{selectedEvent.date?.split('T')[0] || selectedEvent.date}</p></div>
                </div>
                <button onClick={() => setSelectedEvent(null)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
