/**
 * AdastraSky Frontend - Página de Eventos Astronómicos
 * Calendario de eventos astronómicos próximos
 */

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { astronomicalEvents, eventCategories } from '../data/astronomicalData';
import { Calendar, Clock, MapPin, Sparkles, Moon, Globe, Filter, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const EventsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = astronomicalEvents.filter(
    event => selectedCategory === 'all' || event.type === selectedCategory
  ).sort((a, b) => a.date.localeCompare(b.date));

  const getEventIcon = (type) => {
    switch (type) {
      case 'meteor_shower': return Sparkles;
      case 'eclipse': return Moon;
      case 'comet': return Star;
      case 'planetary_event': return Globe;
      default: return Calendar;
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getEventsForMonth = (month, year) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const currentMonthEvents = getEventsForMonth(selectedMonth, selectedYear);

  return (
    <div className="h-screen w-full bg-astroDark flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-3">
        {/* Header */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">Eventos Astronómicos</h1>
          <p className="text-gray-400 mt-1">Calendario de fenómenos astronómicos próximos</p>
        </div>

        {/* Filtros */}
        <div className="bg-astroCard/30 backdrop-blur-lg border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-astroAccent" />
            <div className="flex gap-2 overflow-x-auto">
              {eventCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-astroAccent text-white shadow-lg shadow-astroAccent/50'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {category.id === 'all' && <Calendar className="w-4 h-4" />}
                  {category.id === 'meteor_shower' && <Sparkles className="w-4 h-4" />}
                  {category.id === 'eclipse' && <Moon className="w-4 h-4" />}
                  {category.id === 'comet' && <Star className="w-4 h-4" />}
                  {category.id === 'planetary_event' && <Globe className="w-4 h-4" />}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-auto p-6">
          {/* Navegación de Mes */}
          <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {months[selectedMonth]} {selectedYear}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lista de Eventos del Mes */}
          {currentMonthEvents.length > 0 ? (
            <div className="space-y-4">
              {currentMonthEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                const eventDate = new Date(event.date);
                return (
                  <div
                    key={event.id}
                    className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6 hover:border-astroAccent/50 transition-all cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <EventIcon className="w-8 h-8 text-astroAccent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{event.name}</h3>
                          <span className="px-2 py-1 bg-astroAccent/30 text-astroAccent text-xs font-medium rounded-full">
                            {eventDate.getDate()} {months[eventDate.getMonth()]}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-astroAccent" />
                            {event.best_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-astroAccent" />
                            {event.visibility}
                          </div>
                          <div className="flex items-center gap-1">
                            <Moon className="w-4 h-4 text-astroAccent" />
                            {event.moon_phase}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay eventos este mes</h3>
              <p className="text-gray-400">Selecciona otro mes o cambia el filtro de categoría</p>
            </div>
          )}

          {/* Todos los eventos */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Todos los Eventos Próximos</h3>
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                const eventDate = new Date(event.date);
                return (
                  <div
                    key={event.id}
                    className="bg-astroCard/30 backdrop-blur-lg rounded-lg border border-white/10 p-4 hover:border-astroAccent/50 transition-all cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center gap-4">
                      <EventIcon className="w-5 h-5 text-astroAccent" />
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{event.name}</h4>
                        <p className="text-gray-400 text-sm">{eventDate.getDate()} {months[eventDate.getMonth()]} {eventDate.getFullYear()}</p>
                      </div>
                      <span className="text-xs text-gray-500">{event.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-astroCard rounded-lg border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedEvent.name}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-300 mb-6">{selectedEvent.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-astroDark/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    <span className="text-white">Fecha:</span> {selectedEvent.date}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    <span className="text-white">Pico:</span> {selectedEvent.peak_date}
                  </p>
                </div>
                <div className="bg-astroDark/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    <span className="text-white">Mejor hora:</span> {selectedEvent.best_time}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    <span className="text-white">Visibilidad:</span> {selectedEvent.visibility}
                  </p>
                </div>
              </div>

              <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm">
                  <span className="text-white">Cuerpo celeste:</span> {selectedEvent.parent_body}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  <span className="text-white">Fase lunar:</span> {selectedEvent.moon_phase}
                </p>
              </div>

              <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-2">Consejos de Observación</h4>
                <p className="text-gray-400 text-sm">{selectedEvent.tips}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
