/**
 * AdastraSky Frontend - Página de Observatorios
 * Cards informativas de cada observatorio en las islas
 */

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { observatoriesData, observatoryIslands } from '../data/observatoriesData';
import { Search, MapPin, Calendar, Clock, Star, ArrowRight, Radar } from 'lucide-react';

const ObservatoriesPage = () => {
  const [selectedIsland, setSelectedIsland] = useState('all');
  const [selectedObservatory, setSelectedObservatory] = useState(null);

  const filteredObservatories = observatoriesData.filter(
    obs => selectedIsland === 'all' || obs.island === selectedIsland
  );

  return (
    <div className="h-screen w-full bg-astroDark flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-3">
        {/* Header */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">Observatorios</h1>
          <p className="text-gray-400 mt-1">Descubre los principales observatorios astronómicos de las Islas Canarias</p>
        </div>

        {/* Filtros de islas */}
        <div className="bg-astroCard/30 backdrop-blur-lg border-b border-white/10 p-4">
          <div className="flex gap-2 overflow-x-auto">
            {observatoryIslands.map((island) => (
              <button
                key={island.id}
                onClick={() => setSelectedIsland(island.id)}
                className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all whitespace-nowrap ${
                  selectedIsland === island.id
                    ? 'bg-astroAccent text-white shadow-lg shadow-astroAccent/50'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {island.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObservatories.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                <Radar className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium text-gray-400 mb-1">No hay observatorios en esta isla</p>
                <p className="text-sm">Selecciona otra isla para ver sus observatorios</p>
              </div>
            ) : filteredObservatories.map((observatory) => (
              <div
                key={observatory.id}
                className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden hover:border-astroAccent/50 transition-all cursor-pointer group"
                onClick={() => setSelectedObservatory(observatory)}
              >
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={observatory.image}
                    alt={observatory.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-astroDark/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-astroAccent/90 text-white text-xs font-medium rounded-full">
                      {observatory.island}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{observatory.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{observatory.description}</p>
                  
                  {/* Información clave */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-astroAccent" />
                      <span>{observatory.altitude}m altitud</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Star className="w-4 h-4 text-astroAccent" />
                      <span>Escala Bortle: {observatory.bortle_scale}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-astroAccent" />
                      <span>Desde {observatory.established}</span>
                    </div>
                  </div>

                  {/* Institución */}
                  <div className="text-xs text-gray-500 mb-4">
                    {observatory.institution}
                  </div>

                  {/* Botón */}
                  <button className="flex items-center gap-2 text-astroAccent hover:text-astroAccent/80 transition-colors text-sm font-medium">
                    Ver detalles
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedObservatory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-astroCard rounded-lg border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header con imagen */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={selectedObservatory.image}
                alt={selectedObservatory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-astroDark via-transparent to-transparent" />
              <button
                onClick={() => setSelectedObservatory(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedObservatory.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-astroAccent" />
                    {selectedObservatory.island}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-astroAccent" />
                    Bortle {selectedObservatory.bortle_scale}
                  </span>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">{selectedObservatory.description}</p>

              {/* Información detallada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-astroDark/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Search className="w-5 h-5 text-astroAccent" />
                    Telescopios
                  </h4>
                  <ul className="space-y-2">
                    {selectedObservatory.telescopes.map((telescope) => (
                      <li key={telescope} className="text-gray-400 text-sm">
                        • {telescope}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-astroDark/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-astroAccent" />
                    Áreas de Investigación
                  </h4>
                  <ul className="space-y-2">
                    {selectedObservatory.research_areas.map((area) => (
                      <li key={area} className="text-gray-400 text-sm">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Información de visita */}
              <div className="bg-astroDark/50 rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-astroAccent" />
                  Información de Visita
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">
                      <span className="text-white">Institución:</span> {selectedObservatory.institution}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      <span className="text-white">Establecido:</span> {selectedObservatory.established}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      <span className="text-white">Altitud:</span> {selectedObservatory.altitude}m
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">
                      <span className="text-white">Horario:</span> {selectedObservatory.visitor_info.visiting_hours}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      <span className="text-white">Visitas guiadas:</span> {selectedObservatory.visitor_info.guided_tours ? 'Sí' : 'No'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      <span className="text-white">Reserva:</span> {selectedObservatory.visitor_info.reservation_required ? 'Requerida' : 'No requerida'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setSelectedObservatory(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {selectedObservatory.visitor_info.open_to_public && (
                  <button className="px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors">
                    Reservar Visita
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObservatoriesPage;
