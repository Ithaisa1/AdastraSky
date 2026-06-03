/**
 * AdastraSky Frontend - Página de Perfil de Usuario
 * Gestión de perfil, configuración, notificaciones y eliminación de cuenta
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, Trash2, Save, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ProfilePage = () => {
  const { user, logout, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estado del formulario de perfil
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    bio: '',
    location: '',
  });

  // Estado de configuración
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    eventReminders: true,
    weatherAlerts: true,
    darkMode: true,
    language: 'es',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const token = localStorage.getItem('adastra_session');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          bio: profileData.bio,
          location: profileData.location,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUserData(data.data.user);
        setSaveMessage('success');
      } else {
        setSaveMessage(data.message || 'Error al guardar');
      }
    } catch {
      setSaveMessage('Error de conexión');
    }
    setSaving(false);
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
  };

  const handleDeleteAccount = () => {
    logout();
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen w-full bg-astroDark flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-3">
        {/* Header */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">Perfil de Usuario</h1>
          <p className="text-gray-400 mt-1">Gestiona tu información y preferencias</p>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Tabs de Navegación */}
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-astroAccent text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <User className="w-5 h-5" />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-astroAccent text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Settings className="w-5 h-5" />
                Configuración
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-astroAccent text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notificaciones
              </button>
            </div>

            {/* Tab de Perfil */}
            {activeTab === 'profile' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <form onSubmit={handleProfileSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="Ciudad, País"
                        className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Biografía
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={4}
                      placeholder="Cuéntanos sobre ti..."
                      className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  {saveMessage === 'success' && (
                    <p className="text-green-400 text-sm mt-4">Perfil actualizado correctamente</p>
                  )}
                  {saveMessage && saveMessage !== 'success' && (
                    <p className="text-red-400 text-sm mt-4">{saveMessage}</p>
                  )}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab de Configuración */}
            {activeTab === 'settings' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <form onSubmit={handleSettingsSave}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Modo Oscuro</h3>
                        <p className="text-gray-400 text-sm">Activar tema oscuro</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.darkMode}
                          onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-astroAccent"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Idioma
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                        className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Guardar Configuración
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab de Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <form onSubmit={handleSettingsSave}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Notificaciones por Email</h3>
                        <p className="text-gray-400 text-sm">Recibir notificaciones por correo electrónico</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-astroAccent"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Notificaciones Push</h3>
                        <p className="text-gray-400 text-sm">Recibir notificaciones en el navegador</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.pushNotifications}
                          onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-astroAccent"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Recordatorios de Eventos</h3>
                        <p className="text-gray-400 text-sm">Recibir recordatorios de eventos astronómicos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.eventReminders}
                          onChange={(e) => setSettings({...settings, eventReminders: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-astroAccent"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Alertas Meteorológicas</h3>
                        <p className="text-gray-400 text-sm">Recibir alertas sobre condiciones de observación</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.weatherAlerts}
                          onChange={(e) => setSettings({...settings, weatherAlerts: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-astroAccent"></div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Guardar Preferencias
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sección de Cuenta */}
            <div className="mt-6 bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Gestión de Cuenta</h2>
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors w-full"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Eliminación de Cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Eliminar Cuenta</h2>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
