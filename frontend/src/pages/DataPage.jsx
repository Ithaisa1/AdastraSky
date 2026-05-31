/**
 * AdastraSky Frontend - Página de Datos Astronómicos
 * Información de constelaciones y eventos astronómicos próximos
 */

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { constellationsData, astronomicalEvents, eventCategories } from '../data/astronomicalData';
import { Star, Calendar, MapPin, Clock, Sparkles, Moon, Globe } from 'lucide-react';

const DataPage = () => {
  const [activeTab, setActiveTab] = useState('constellations');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredEvents = astronomicalEvents.filter(
    event => selectedCategory === 'all' || event.type === selectedCategory
  );

  const getEventIcon = (type) => {
    switch (type) {
      case 'meteor_shower': return Sparkles;
      case 'eclipse': return Moon;
      case 'comet': return Star;
      case 'planetary_event': return Globe;
      default: return Star;
    }
  };

  return (
    <div className="h-screen w-full bg-astroDark flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">Datos Astronómicos</h1>
          <p className="text-gray-400 mt-1">Constelaciones y eventos astronómicos próximos</p>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-astroCard/30 backdrop-blur-lg border-b border-white/10 p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('constellations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'constellations'
                  ? 'bg-astroAccent text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Star className="w-5 h-5" />
              Constelaciones
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'events'
                  ? 'bg-astroAccent text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Eventos
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-auto p-6">
          {/* Tab de Constelaciones */}
          {activeTab === 'constellations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {constellationsData.map((constellation) => (
                <div
                  key={constellation.id}
                  className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden hover:border-astroAccent/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedItem(constellation)}
                >
                  {/* Imagen */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={constellation.image}
                      alt={constellation.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-astroDark/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-astroAccent/90 text-white text-xs font-medium rounded-full">
                        {constellation.season}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{constellation.name}</h3>
                    <p className="text-gray-500 text-sm mb-2 italic">{constellation.latinName}</p>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{constellation.description}</p>
                    
                    {/* Información clave */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Star className="w-4 h-4 text-astroAccent" />
                        <span>{constellation.visible_from}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="w-4 h-4 text-astroAccent" />
                        <span>{constellation.best_viewing}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab de Eventos */}
          {activeTab === 'events' && (
            <div>
              {/* Filtros de categorías */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                    {category.id === 'all' && <Star className="w-4 h-4" />}
                    {category.id === 'meteor_shower' && <Sparkles className="w-4 h-4" />}
                    {category.id === 'eclipse' && <Moon className="w-4 h-4" />}
                    {category.id === 'comet' && <Star className="w-4 h-4" />}
                    {category.id === 'planetary_event' && <Globe className="w-4 h-4" />}
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Lista de eventos */}
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const EventIcon = getEventIcon(event.type);
                  return (
                    <div
                      key={event.id}
                      className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6 hover:border-astroAccent/50 transition-all cursor-pointer"
                      onClick={() => setSelectedItem(event)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <EventIcon className="w-8 h-8 text-astroAccent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{event.name}</h3>
                            <span className="px-2 py-1 bg-astroAccent/30 text-astroAccent text-xs font-medium rounded-full">
                              {event.peak_date}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-astroAccent" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-astroAccent" />
                              {event.visibility}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-astroAccent" />
                              {event.best_time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-astroCard rounded-lg border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header con imagen */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-astroDark via-transparent to-transparent" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedItem.name}</h2>
                {selectedItem.latinName && (
                  <p className="text-gray-500 italic">{selectedItem.latinName}</p>
                )}
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">{selectedItem.description}</p>

              {/* Información detallada */}
              {selectedItem.brightest_stars && (
                <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-astroAccent" />
                    Estrellas Más Brillantes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.brightest_stars.map((star, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full">
                        {star}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.mythology && (
                <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Mitología</h4>
                  <p className="text-gray-400 text-sm">{selectedItem.mythology}</p>
                </div>
              )}

              {selectedItem.parent_body && (
                <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Cuerpo Celeste</h4>
                  <p className="text-gray-400 text-sm">{selectedItem.parent_body}</p>
                </div>
              )}

              {selectedItem.tips && (
                <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Consejos de Observación</h4>
                  <p className="text-gray-400 text-sm">{selectedItem.tips}</p>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedItem.visible_from && (
                  <div className="bg-astroDark/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">
                      <span className="text-white">Visible desde:</span> {selectedItem.visible_from}
                    </p>
                  </div>
                )}
                {selectedItem.best_viewing && (
                  <div className="bg-astroDark/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">
                      <span className="text-white">Mejor visibilidad:</span> {selectedItem.best_viewing}
                    </p>
                  </div>
                )}
                {selectedItem.area && (
                  <div className="bg-astroDark/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">
                      <span className="text-white">Área:</span> {selectedItem.area}
                    </p>
                  </div>
                )}
                {selectedItem.moon_phase && (
                  <div className="bg-astroDark/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">
                      <span className="text-white">Fase lunar:</span> {selectedItem.moon_phase}
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
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

export default DataPage;
