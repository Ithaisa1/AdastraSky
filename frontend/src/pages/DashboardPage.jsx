/**
 * AdastraSky Frontend - Dashboard Principal
 * Layout con Sidebar, mapa interactivo, widgets y panel lateral de ficha técnica
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import InteractiveMap from '../components/InteractiveMap';
import SanctuaryPanel from '../components/SanctuaryPanel';
import IslandLoading from '../components/IslandLoading';
import { Star, Calendar, MapPin, Activity } from 'lucide-react';
import { observatoriesData } from '../data/observatoriesData';
import { astronomicalEvents } from '../data/astronomicalData';

const DashboardPage = () => {
  const { t } = useTranslation();
  const [selectedZone, setSelectedZone] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState(null);

  const handleZoneSelect = async (zone) => {
    setIsLoading(true);
    setSelectedIsland(zone.island);
    
    // Simular carga de datos
    setTimeout(() => {
      setSelectedZone(zone);
      setIsLoading(false);
    }, 1500);
  };

  const handleCoordinateClick = (coordinates) => {
    setIsLoading(true);
    setSelectedIsland('Canarias');
    
    // Simular carga de datos para coordenadas libres
    setTimeout(() => {
      setSelectedZone({
        name: 'Coordenadas Seleccionadas',
        island: 'Canarias',
        category: 'landscape_viewpoint',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        bortle_scale: 3,
        altitude: 500,
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-astroDark flex">
      {/* Sidebar de Navegación */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header del Dashboard */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Vista general del sistema astronómico</p>
        </div>

        {/* Widgets de Estadísticas */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-astroAccent" />
              <span className="text-xs text-gray-400">Observatorios</span>
            </div>
            <div className="text-2xl font-bold text-white">{observatoriesData.length}</div>
            <div className="text-xs text-gray-400">Activos en Canarias</div>
          </div>

          <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-astroAccent" />
              <span className="text-xs text-gray-400">Próximos Eventos</span>
            </div>
            <div className="text-2xl font-bold text-white">{astronomicalEvents.length}</div>
            <div className="text-xs text-gray-400">Este mes</div>
          </div>

          <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-astroAccent" />
              <span className="text-xs text-gray-400">Santuarios</span>
            </div>
            <div className="text-2xl font-bold text-white">42</div>
            <div className="text-xs text-gray-400">Puntos de interés</div>
          </div>

          <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-astroAccent" />
              <span className="text-xs text-gray-400">Actividad</span>
            </div>
            <div className="text-2xl font-bold text-white">85%</div>
            <div className="text-xs text-gray-400">Condiciones óptimas</div>
          </div>
        </div>

        {/* Contenido Principal con Mapa */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden p-6 pt-0">
          {/* Panel Izquierdo: Mapa Interactivo */}
          <div className="flex-1 h-full">
            <InteractiveMap
              onZoneSelect={handleZoneSelect}
              onCoordinateClick={handleCoordinateClick}
            />
          </div>

          {/* Panel Derecho: Ficha Técnica o Loading */}
          <div className="w-full xl:w-[450px] h-full bg-astroCard border-l border-white/10">
            {isLoading ? (
              <IslandLoading islandName={selectedIsland} />
            ) : selectedZone ? (
              <SanctuaryPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('dashboard.title')}
                  </h3>
                  <p className="text-gray-400">
                    Selecciona un marcador en el mapa o haz clic en cualquier coordenada
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
