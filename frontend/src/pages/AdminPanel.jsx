/**
 * AdastraSky Frontend - Panel de Administración
 * Interfaz de control exclusiva para administradores con protección de rol
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { santuariosData } from '../data/santuariosData';
import { Plus, Trash2, Shield, Database, Activity, AlertTriangle } from 'lucide-react';

const AdminPanel = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [sanctuaries, setSanctuaries] = useState(santuariosData);
  const [showAddModal, setShowAddModal] = useState(false);

  // Protección de rol - Solo administradores pueden acceder
  if (role !== 'admin') {
    return (
      <div className="h-screen w-full bg-astroDark flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-red-500 mb-4">
            🚨 ACCESO DENEGADO
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            SE REQUIEREN CREDENCIALES DE COMANDANTE DE MISIÓN
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Esta área está restringida a personal autorizado con nivel de acceso administrativo.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = (id) => {
    // Simular eliminación de santuario
    setSanctuaries(sanctuaries.filter(s => s.id !== id));
  };

  const handleAddSanctuary = () => {
    // Simular añadir nuevo santuario
    setShowAddModal(false);
  };

  // Categoría en español
  const categoryNames = {
    observatory: 'Observatorio Astronómico',
    astronomical_viewpoint: 'Mirador Astronómico',
    landscape_viewpoint: 'Mirador Paisajístico',
  };

  // Colores por categoría
  const categoryColors = {
    observatory: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    astronomical_viewpoint: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    landscape_viewpoint: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="h-screen w-full bg-astroDark flex">
      {/* Sidebar de Navegación */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-astroCard border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-400">
                Red de Monitorización Estelar - Canary Islands Observatory Network
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-astroAccent/20 text-astroAccent rounded-lg border border-astroAccent/30 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Comandante: {user?.first_name} {user?.last_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-astroAccent" />
                <span className="text-gray-400 text-sm">Total Santuarios</span>
              </div>
              <p className="text-3xl font-bold text-white">{sanctuaries.length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Observatorios</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {sanctuaries.filter(s => s.category === 'observatory').length}
              </p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400 text-sm">Miradores Astronómicos</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {sanctuaries.filter(s => s.category === 'astronomical_viewpoint').length}
              </p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">Miradores Paisajísticos</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {sanctuaries.filter(s => s.category === 'landscape_viewpoint').length}
              </p>
            </div>
          </div>

          {/* Tabla de Datos */}
          <div className="bg-astroCard rounded-lg border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Red de Santuarios</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Añadir Nuevo Santuario
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-astroDark/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Isla
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Latitud
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Longitud
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Altitud
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Bortle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sanctuaries.map((sanctuary) => (
                    <tr key={sanctuary.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">
                        {sanctuary.id}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {sanctuary.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {sanctuary.island}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${categoryColors[sanctuary.category]}`}>
                          {categoryNames[sanctuary.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">
                        {sanctuary.latitude.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">
                        {sanctuary.longitude.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {sanctuary.altitude} m
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                          sanctuary.bortle_scale <= 2 ? 'bg-green-500/20 text-green-400' :
                          sanctuary.bortle_scale <= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {sanctuary.bortle_scale}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(sanctuary.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para añadir santuario */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Añadir Nuevo Santuario</h3>
            <p className="text-gray-400 mb-6">
              Esta funcionalidad está en desarrollo. En producción, permitirá añadir nuevos santuarios a la red.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSanctuary}
                className="flex-1 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
