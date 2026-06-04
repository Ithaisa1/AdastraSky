/**
 * AdastraSky Frontend - Dashboard de Usuario
 * Panel privado para configurar alertas y guardar favoritos
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Star, Bell, Settings, MapPin, Moon } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const UserDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [favorites] = useState([]);
  const [alerts] = useState([]);

  return (
    <div className="min-h-screen w-full bg-astroDark flex overflow-hidden">
      {/* Sidebar de Navegación */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-astroCard border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm text-gray-400">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Sección de Favoritos */}
          <div className="bg-astroCard rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-astroAccent/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-astroAccent" />
              </div>
              <h2 className="text-lg font-semibold text-white">Santuarios Favoritos</h2>
            </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No tienes santuarios favoritos aún</p>
              <p className="text-sm text-gray-500">
                Explora el mapa y añade tus lugares favoritos
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-4 px-6 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors"
              >
                Explorar Mapa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-astroDark/50 p-4 rounded-lg border border-white/10 hover:border-astroAccent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{favorite.name}</h3>
                    <button className="text-astroAccent hover:text-astroAccent/80">
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{favorite.island}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    Bortle {favorite.bortle_scale}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Alertas */}
        <div className="bg-astroCard rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-astroAccent/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-astroAccent" />
            </div>
            <h2 className="text-lg font-semibold text-white">Alertas Automáticas</h2>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No tienes alertas configuradas</p>
              <p className="text-sm text-gray-500">
                Configura alertas para recibir notificaciones sobre condiciones óptimas
              </p>
              <button className="mt-4 px-6 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors">
                Configurar Alerta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-astroDark/50 p-4 rounded-lg border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-astroAccent/20 rounded-lg flex items-center justify-center">
                      <Moon className="w-5 h-5 text-astroAccent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{alert.name}</h3>
                      <p className="text-sm text-gray-400">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Activa
                    </span>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Configuración */}
        <div className="bg-astroCard rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-astroAccent/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-astroAccent" />
            </div>
            <h2 className="text-lg font-semibold text-white">Configuración</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-astroDark/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Idioma Preferido</p>
                <p className="text-sm text-gray-400">Español</p>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                Cambiar
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-astroDark/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Notificaciones por Email</p>
                <p className="text-sm text-gray-400">Recibir alertas meteorológicas</p>
              </div>
              <button className="px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors">
                Activado
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-astroDark/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Privacidad</p>
                <p className="text-sm text-gray-400">Gestionar tus datos personales</p>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                Gestionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserDashboardPage;
