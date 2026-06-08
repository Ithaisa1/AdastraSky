/**
 * AdastraSky Frontend - Página de Perfil de Usuario
 * Gestión de perfil, configuración, notificaciones y eliminación de cuenta
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, User, Settings, Bell, Trash2, Save, LogOut, Camera, Image as ImageIcon, MapPin, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, logout, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [userExperiences, setUserExperiences] = useState([]);
  const [loadingExp, setLoadingExp] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const TABS = [
    { id: 'profile', label: t('profile.personalInfo'), icon: 'User' },
    { id: 'gallery', label: t('experiences.myGallery'), icon: 'Camera' },
    { id: 'settings', label: t('profile.preferences'), icon: 'Settings' },
    { id: 'notifications', label: 'Notificaciones', icon: 'Bell' },
  ];

  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingExp(true);
    fetch(`${API_URL}/api/experiences/user/${user.id}`)
      .then(r => r.json())
      .then(data => { if (data.status === 'success') setUserExperiences(data.data); })
      .catch(() => {})
      .finally(() => setLoadingExp(false));
  }, [user?.id]);
  
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
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        {/* Header */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">Perfil de Usuario</h1>
          <p className="text-gray-400 mt-1">Gestiona tu información y preferencias</p>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Tabs de Navegación */}
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon === 'User' ? User : tab.icon === 'Camera' ? Camera : tab.icon === 'Settings' ? Settings : Bell;
                const label = tab.id === 'gallery'
                  ? `${tab.label}${userExperiences.length > 0 ? ` (${userExperiences.reduce((s, e) => s + (e.images?.length || 0), 0)})` : ''}`
                  : tab.label;
                return (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-astroAccent text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}>
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                );
              })}
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

            {/* Tab de Galería */}
            {activeTab === 'gallery' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-astroAccent" />
                  {t('experiences.myGallery')}
                </h2>
                {loadingExp ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square bg-astroDark rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : userExperiences.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-astroDark/50 border border-white/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="text-white font-medium mb-1">Aún no has compartido experiencias</h3>
                    <p className="text-sm text-gray-400 mb-4">Comparte tus vivencias en los santuarios estelares</p>
                    <button onClick={() => navigate('/experiencias')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-astroAccent/20 text-astroAccent rounded-lg hover:bg-astroAccent/30 transition-colors text-sm">
                      <Camera className="w-4 h-4" />
                      Ir a Experiencias
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {userExperiences.flatMap(exp =>
                      (exp.images || []).map((img, imgIdx) => (
                        <button key={`${exp.id}-${imgIdx}`}
                          onClick={() => setPreviewImage({ img, exp })}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-astroAccent/40 transition-all">
                          <img src={img.startsWith('http') ? img : `${API_URL}${img}`}
                            alt={exp.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-2">
                            <p className="text-sm font-medium text-white text-center leading-tight">{exp.title}</p>
                            <p className="text-xs text-gray-300 mt-1">{new Date(exp.created_at).toLocaleDateString()}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {previewImage && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="max-w-3xl w-full bg-astroCard rounded-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
                      <div className="relative bg-astroDark">
                        <img src={previewImage.img.startsWith('http') ? previewImage.img : `${API_URL}${previewImage.img}`}
                          alt={previewImage.exp.title}
                          className="w-full max-h-[70vh] object-contain mx-auto" />
                        <button onClick={() => setPreviewImage(null)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white">{previewImage.exp.title}</h3>
                        {previewImage.exp.description && (
                          <p className="text-sm text-gray-400 mt-1">{previewImage.exp.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(previewImage.exp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
