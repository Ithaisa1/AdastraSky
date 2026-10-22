/**
 * AdastraSky Frontend - Página de Perfil de Usuario
 * Gestión de perfil, idioma, galería propia y eliminación de cuenta.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, User, Settings, Trash2, Save, LogOut, Camera, Clock, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { API_URL, assetUrl } from '../config/api';

const inputClass = 'w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors';

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, token, logout, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [userExperiences, setUserExperiences] = useState([]);
  const [loadingExp, setLoadingExp] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const TABS = [
    { id: 'profile', label: t('profile.personalInfo'), Icon: User },
    { id: 'gallery', label: t('experiences.myGallery'), Icon: Camera },
    { id: 'settings', label: t('profile.preferences'), Icon: Settings },
  ];

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });
  const [language, setLanguage] = useState(user?.preferred_language || i18n.language || 'es');

  // Datos frescos del servidor: evita sobrescribir la biografía o la ubicación con valores vacíos
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const u = data?.data?.user;
        if (!u) return;
        setProfileData({ firstName: u.first_name || '', lastName: u.last_name || '', email: u.email || '', bio: u.bio || '', location: u.location || '' });
        if (u.preferred_language) setLanguage(u.preferred_language);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingExp(true);
    fetch(`${API_URL}/api/experiences/user/${user.id}`)
      .then(r => r.json())
      .then(data => { if (data.status === 'success') setUserExperiences(data.data); })
      .catch(() => {})
      .finally(() => setLoadingExp(false));
  }, [user?.id]);

  const saveProfile = async (body, onOk) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        updateUserData(data.data.user);
        onOk?.();
        setSaveMessage('success');
      } else {
        setSaveMessage(data.code === 'EMAIL_EXISTS' ? t('profile.emailExists') : t('profile.saveError'));
      }
    } catch {
      setSaveMessage(t('profile.connectionError'));
    }
    setSaving(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    saveProfile({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      bio: profileData.bio,
      location: profileData.location,
    });
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    saveProfile({ preferred_language: language }, () => i18n.changeLanguage(language));
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (res.ok) {
        logout();
        navigate('/');
        return;
      }
      setDeleteError(res.status === 401 ? t('profile.wrongPassword') : t('profile.deleteError'));
    } catch {
      setDeleteError(t('profile.connectionError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const photoCount = userExperiences.reduce((s, e) => s + (e.images?.length || 0), 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString(i18n.language);

  const SaveFeedback = () => (
    <>
      {saveMessage === 'success' && <p className="text-green-400 text-sm mt-4" role="status">{t('profile.saved')}</p>}
      {saveMessage && saveMessage !== 'success' && <p className="text-red-400 text-sm mt-4" role="alert">{saveMessage}</p>}
    </>
  );

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">{t('profile.title')}</h1>
          <p className="text-gray-400 mt-1">{t('profile.subtitle')}</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto" role="tablist">
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} role="tab" aria-selected={activeTab === id}
                  onClick={() => { setActiveTab(id); setSaveMessage(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === id ? 'bg-astroAccent text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {id === 'gallery' && photoCount > 0 ? `${label} (${photoCount})` : label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <form onSubmit={handleProfileSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="pf-first" className="block text-sm font-medium text-gray-300 mb-2">{t('profile.firstName')}</label>
                      <input id="pf-first" type="text" value={profileData.firstName} maxLength={100}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="pf-last" className="block text-sm font-medium text-gray-300 mb-2">{t('profile.lastName')}</label>
                      <input id="pf-last" type="text" value={profileData.lastName} maxLength={100}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="pf-email" className="block text-sm font-medium text-gray-300 mb-2">{t('contact.email')}</label>
                      <input id="pf-email" type="email" value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="pf-location" className="block text-sm font-medium text-gray-300 mb-2">{t('experiences.location')}</label>
                      <input id="pf-location" type="text" value={profileData.location} placeholder={t('profile.locationPlaceholder')}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="pf-bio" className="block text-sm font-medium text-gray-300 mb-2">{t('profile.bio')}</label>
                    <textarea id="pf-bio" value={profileData.bio} rows={4} placeholder={t('profile.bioPlaceholder')}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} className={`${inputClass} resize-none`} />
                  </div>
                  <SaveFeedback />
                  <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors disabled:opacity-50">
                      <Save className="w-5 h-5" aria-hidden="true" />
                      {saving ? t('profile.saving') : t('profile.saveChanges')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-astroAccent" aria-hidden="true" />
                  {t('experiences.myGallery')}
                </h2>
                {loadingExp ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="status" aria-label={t('common.loading')}>
                    {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-astroDark rounded-xl animate-pulse" />)}
                  </div>
                ) : photoCount === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-astroDark/50 border border-white/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-500" aria-hidden="true" />
                    </div>
                    <h3 className="text-white font-medium mb-1">{t('experiences.noGallery')}</h3>
                    <p className="text-sm text-gray-400 mb-4">{t('profile.galleryHint')}</p>
                    <button onClick={() => navigate('/experiencias')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-astroAccent/20 text-astroAccent rounded-lg hover:bg-astroAccent/30 transition-colors text-sm">
                      <Camera className="w-4 h-4" aria-hidden="true" />
                      {t('experiences.goToExperiences')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {userExperiences.flatMap(exp =>
                      (exp.images || []).map((img, imgIdx) => (
                        <button key={`${exp.id}-${imgIdx}`} onClick={() => setPreviewImage({ img, exp })}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-astroAccent/40 transition-all">
                          <img src={assetUrl(img)} alt={exp.title} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-2">
                            <p className="text-sm font-medium text-white text-center leading-tight">{exp.title}</p>
                            <p className="text-xs text-gray-300 mt-1">{fmtDate(exp.created_at)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {previewImage && (
                  <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div role="dialog" aria-modal="true" className="max-w-3xl w-full bg-astroCard rounded-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
                      <div className="relative bg-astroDark">
                        <img src={assetUrl(previewImage.img)} alt={previewImage.exp.title} className="w-full max-h-[70vh] object-contain mx-auto" />
                        <button onClick={() => setPreviewImage(null)} aria-label={t('common.close')}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                          <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white">{previewImage.exp.title}</h3>
                        {previewImage.exp.description && <p className="text-sm text-gray-400 mt-1">{previewImage.exp.description}</p>}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {fmtDate(previewImage.exp.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <form onSubmit={handleSettingsSave}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="pf-language" className="block text-sm font-medium text-gray-300 mb-2">{t('profile.language')}</label>
                      <select id="pf-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                        <option value="es" lang="es">Español</option>
                        <option value="en" lang="en">English</option>
                        <option value="de" lang="de">Deutsch</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">{t('profile.languageHint')}</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                      <Bell className="w-5 h-5 text-gray-400 mt-0.5" aria-hidden="true" />
                      <div>
                        <h3 className="text-white font-medium">{t('profile.notificationsTitle')}</h3>
                        <p className="text-gray-400 text-sm">{t('profile.notificationsSoon')}</p>
                      </div>
                    </div>
                  </div>
                  <SaveFeedback />
                  <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors disabled:opacity-50">
                      <Save className="w-5 h-5" aria-hidden="true" />
                      {saving ? t('profile.saving') : t('profile.saveSettings')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-6 bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{t('profile.account')}</h2>
              <div className="space-y-4">
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors w-full">
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  {t('nav.logout')}
                </button>
                <button onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteError(''); }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors w-full">
                  <Trash2 className="w-5 h-5" aria-hidden="true" />
                  {t('profile.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <form onSubmit={handleDeleteAccount} role="dialog" aria-modal="true" aria-labelledby="delete-title"
            className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4">
            <h2 id="delete-title" className="text-xl font-bold text-white mb-4">{t('profile.deleteAccount')}</h2>
            <p className="text-gray-300 mb-4">{t('profile.deleteWarning')}</p>
            <label htmlFor="delete-password" className="block text-sm text-gray-300 mb-2">{t('profile.confirmPassword')}</label>
            <input id="delete-password" type="password" autoComplete="current-password" required value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)} className={inputClass} />
            {deleteError && <p className="text-red-400 text-sm mt-2" role="alert">{deleteError}</p>}
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={deleting || !deletePassword}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50">
                {deleting ? t('profile.deleting') : t('profile.deleteConfirm')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
