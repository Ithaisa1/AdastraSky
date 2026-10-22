import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Plus, Trash2, Edit3, Shield, Database, Activity, AlertTriangle,
  X, Save, Search, Users, MapPin, Image as ImageIcon,
  ToggleLeft, ToggleRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { API_URL } from '../config/api';


const INITIAL_ZONE = {
  name: '', island: 'Tenerife', municipality: '', category: 'observatory',
  subcategory: '', bortle_scale: 5, latitude: '', longitude: '', altitude: 0,
  access_type: 'car', has_parking: false, has_bathrooms: false, has_cafe: false,
  has_mobile_coverage: false, has_electricity: false, has_water: false,
  safety_risk: 1, landscape_quality: 3, astro_orientation: 3,
  photo_composition: 3, photographer_access: 3, description: '', image_url: ''
};

const ISLANDS = ['Gran Canaria','Tenerife','La Palma','Lanzarote','Fuerteventura','El Hierro','La Gomera','La Graciosa'];
const CATEGORIES = ['observatory','astronomical_viewpoint','landscape_viewpoint'];
const SUBCATEGORIES = ['volcano','cliff','forest','sea_of_clouds','caldera','coast','dunes','hidden_spot','starlight','natural_observatory','dark_zone','educational','scientific','touristic'];
const ACCESS_TYPES = ['car','4x4','trail','hike','restricted'];

const AdminPanel = () => {
  const { t, i18n } = useTranslation();
  const { role, user, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('zones');
  const [zones, setZones] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('island');
  const [sortOrder, setSortOrder] = useState('ASC');

  const handleSort = (field) => {
    const defaultDesc = ['category', 'bortle_scale'];
    if (sortBy === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder(defaultDesc.includes(field) ? 'DESC' : 'ASC');
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState(INITIAL_ZONE);

  const [editUser, setEditUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({});

  const [experiences, setExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchZones = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/zones`, getAuthHeaders());
      setZones(res.data.data.zones);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errLoadZones'));
    }
  }, [getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, getAuthHeaders());
      setUsers(res.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errLoadUsers'));
    }
  }, [getAuthHeaders]);

  const fetchExperiences = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/experiences`, getAuthHeaders());
      setExperiences(res.data.data.experiences);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errLoadExperiences'));
    }
  }, [getAuthHeaders]);

  const handleDeleteExperienceImage = async (expId, imageIndex) => {
    try {
      await axios.delete(`${API_URL}/api/admin/experiences/${expId}/images/${imageIndex}`, getAuthHeaders());
      await fetchExperiences();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errDeleteImage'));
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/experiences/${id}`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchExperiences();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errDeleteExperience'));
    }
  };

  useEffect(() => {
    if (role !== 'admin') return;
    setLoading(true);
    Promise.all([fetchZones(), fetchUsers()]).finally(() => setLoading(false));
  }, [role, fetchZones, fetchUsers]);

  useEffect(() => {
    if (role !== 'admin' || activeTab !== 'experiences') return;
    setExperiencesLoading(true);
    fetchExperiences().finally(() => setExperiencesLoading(false));
  }, [role, activeTab, fetchExperiences]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreateModal = () => {
    setEditingZone(null);
    setFormData(INITIAL_ZONE);
    setShowModal(true);
  };

  const openEditModal = (zone) => {
    setEditingZone(zone);
    setFormData({ ...INITIAL_ZONE, ...zone });
    setShowModal(true);
  };

  const handleSaveZone = async () => {
    try {
      if (editingZone) {
        await axios.put(`${API_URL}/api/admin/zones/${editingZone.id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API_URL}/api/admin/zones`, formData, getAuthHeaders());
      }
      setShowModal(false);
      await fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errSaveZone'));
    }
  };

  const handleDeleteZone = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/zones/${id}`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errDeleteZone'));
    }
  };

  const openEditUserModal = (u) => {
    setEditUser(u);
    setUserForm({ role: u.role, is_active: u.is_active, first_name: u.first_name, last_name: u.last_name, email: u.email });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${editUser.id}`, userForm, getAuthHeaders());
      setShowUserModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errUpdateUser'));
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errDeactivateUser'));
    }
  };

  const handleHardDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}/hard`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errDeleteUser'));
    }
  };

  const filteredZones = zones.filter(z =>
    !search || z.name?.toLowerCase().includes(search.toLowerCase()) ||
    z.island?.toLowerCase().includes(search.toLowerCase()) ||
    z.municipality?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[sortBy] ?? '';
    const bVal = b[sortBy] ?? '';
    const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
    return sortOrder === 'ASC' ? cmp : -cmp;
  });

  const filteredUsers = users.filter(u =>
    !search || u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (role !== 'admin') {
    return (
      <div className="h-screen w-full bg-astroDark flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-red-500 mb-4">{t('admin.accessDenied')}</h1>
          <p className="text-xl text-gray-300 mb-2">{t('admin.credentialsRequired')}</p>
          <p className="text-sm text-gray-500 mb-8">{t('admin.restricted')}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors">
            {t('admin.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="bg-astroCard border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('admin.title')}</h1>
              <p className="text-gray-400">{t('admin.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-astroAccent/20 text-astroAccent rounded-lg border border-astroAccent/30 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">{user?.first_name} {user?.last_name}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
            <span className="text-red-400 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-astroAccent" />
                <span className="text-gray-400 text-sm">{t('admin.totalZones')}</span>
              </div>
              <p className="text-3xl font-bold text-white">{zones.length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">{t('admin.observatories')}</span>
              </div>
              <p className="text-3xl font-bold text-white">{zones.filter(z => z.category === 'observatory').length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400 text-sm">{t('admin.usersStat')}</span>
              </div>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">{t('admin.admins')}</span>
              </div>
              <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>

          <div className="flex gap-1 mb-4 overflow-x-auto">
            <button onClick={() => { setActiveTab('zones'); setSearch(''); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'zones' ? 'bg-astroAccent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <MapPin className="w-4 h-4" /> {t('admin.tabZones')}
            </button>
            <button onClick={() => { setActiveTab('users'); setSearch(''); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-astroAccent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <Users className="w-4 h-4" /> {t('admin.usersStat')}
            </button>
            <button onClick={() => { setActiveTab('experiences'); setSearch(''); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'experiences' ? 'bg-astroAccent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <ImageIcon className="w-4 h-4" /> {t('admin.tabExperiences')}
            </button>
          </div>

          <div className="bg-astroCard rounded-lg border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text" placeholder={activeTab === 'zones' ? t('admin.searchZones') : activeTab === 'experiences' ? t('admin.searchExperiences') : t('admin.searchUsers')}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-astroAccent/50"
                />
              </div>
              {activeTab === 'zones' && (
                <button onClick={openCreateModal} className="flex items-center justify-center gap-2 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors text-sm whitespace-nowrap">
                  <Plus className="w-4 h-4" /> {t('admin.newZone')}
                </button>
              )}
            </div>

            {loading || (activeTab === 'experiences' && experiencesLoading) ? (
              <div className="p-12 text-center text-gray-500">{t('admin.loading')}</div>
            ) : activeTab === 'zones' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-astroDark/50">
                    <tr>
                      {[
                        { key: 'name', label: t('admin.name') },
                        { key: 'island', label: t('admin.island') },
                        { key: 'category', label: t('admin.category') },
                        { key: 'bortle_scale', label: 'Bortle' },
                        { key: 'altitude', label: t('admin.altitude') },
                      ].map(col => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort(col.key)}>
                          <span className="flex items-center gap-1">
                            {col.label}
                            {sortBy === col.key ? (
                              sortOrder === 'ASC' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUp className="w-3 h-3 opacity-0" />
                            )}
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.active')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredZones.map(zone => (
                      <tr key={zone.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-white">{zone.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{zone.island}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded border bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {zone.category === 'observatory' ? t('admin.catObservatory') : zone.category === 'astronomical_viewpoint' ? t('admin.catAstro') : t('admin.catLandscape')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${zone.bortle_scale <= 2 ? 'bg-green-500/20 text-green-400' : zone.bortle_scale <= 4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {zone.bortle_scale}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{zone.altitude} m</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${zone.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {zone.is_active !== false ? t('common.yes') : t('common.no')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEditModal(zone)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400" title={t('admin.edit')}>
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'zone', id: zone.id, name: zone.name })} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title={t('admin.deactivate')}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredZones.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        {search ? t('admin.noZonesFound') : t('admin.noZones')}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'experiences' ? (
              <div className="space-y-3 p-4">
                {experiences.length === 0 ? (
                  <div className="p-12 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">{t('admin.noExperiences')}</p>
                  </div>
                ) : (
                  experiences.map(exp => (
                    <div key={exp.id} className="bg-astroDark/30 rounded-lg border border-white/10 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">{exp.title}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {exp.author?.first_name} {exp.author?.last_name} · {exp.author?.email} · {new Date(exp.created_at).toLocaleDateString()}
                          </p>
                          {exp.description && (
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{exp.description}</p>
                          )}
                        </div>
                        <button onClick={() => setConfirmDelete({ type: 'experience', id: exp.id, name: exp.title })}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 flex-shrink-0 ml-2" title={t('admin.deleteExperience')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {exp.images && exp.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exp.images.map((img, idx) => (
                            <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                              <img src={img.startsWith('http') ? img : `${API_URL}${img}`} alt={`${exp.title} ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }} />
                              <button onClick={() => handleDeleteExperienceImage(exp.id, idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title={t('admin.deleteImage')}>
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-astroDark/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.email')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.role')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.active')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.language')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.lastLogin')}</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-white">{u.first_name} {u.last_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.is_active ? t('common.yes') : t('common.no')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{u.preferred_language}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString(i18n.language) : t('admin.never')}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEditUserModal(u)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400" title={t('admin.edit')}>
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'user', id: u.id, name: `${u.first_name} ${u.last_name}` })} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title={t('admin.deactivate')}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        {search ? t('admin.noUsersFound') : t('admin.noUsers')}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowModal(false)}>
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingZone ? t('admin.editZone') : t('admin.newZone')}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">{t('admin.nameRequired')}</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.islandRequired')}</label>
                <select name="island" value={formData.island} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  {ISLANDS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.municipality')}</label>
                <input name="municipality" value={formData.municipality} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.categoryRequired')}</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.subcategory')}</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  <option value="">--</option>
                  {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.latitudeRequired')}</label>
                <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.longitudeRequired')}</label>
                <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.altitudeRequired')}</label>
                <input name="altitude" type="number" value={formData.altitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.bortleRequired')}</label>
                <input name="bortle_scale" type="number" min="1" max="9" value={formData.bortle_scale} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.accessType')}</label>
                <select name="access_type" value={formData.access_type} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  {ACCESS_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.safetyRisk')}</label>
                <input name="safety_risk" type="number" min="1" max="5" value={formData.safety_risk} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">{t('admin.description')}</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">{t('admin.imageUrl')}</label>
                <input name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['has_parking','has_bathrooms','has_cafe','has_mobile_coverage','has_electricity','has_water'].map(f => (
                    <label key={f} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input type="checkbox" name={f} checked={formData[f]} onChange={handleInputChange} className="rounded bg-astroDark border-white/20" />
                      {f.replace('has_', '').replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                {t('admin.cancel')}
              </button>
              <button onClick={handleSaveZone} className="flex-1 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {editingZone ? t('admin.update') : t('admin.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowUserModal(false)}>
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{t('admin.editUser')}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.name')}</label>
                <input value={userForm.first_name} onChange={e => setUserForm({ ...userForm, first_name: e.target.value })} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.lastName')}</label>
                <input value={userForm.last_name} onChange={e => setUserForm({ ...userForm, last_name: e.target.value })} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.email')}</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.role')}</label>
                <div className="flex gap-2">
                  <button onClick={() => setUserForm({ ...userForm, role: 'user' })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userForm.role === 'user' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-400 border border-transparent'}`}>
                    User
                  </button>
                  <button onClick={() => setUserForm({ ...userForm, role: 'admin' })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userForm.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 border border-transparent'}`}>
                    Admin
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admin.status')}</label>
                <button onClick={() => setUserForm({ ...userForm, is_active: !userForm.is_active })} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userForm.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {userForm.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {userForm.is_active ? t('admin.active') : t('admin.inactive')}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUserModal(false)} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                {t('admin.cancel')}
              </button>
              <button onClick={handleSaveUser} className="flex-1 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {t('admin.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">{t('admin.confirm')}</h3>
            </div>
            <p className="text-gray-300 mb-2">
              {confirmDelete.type === 'zone'
                ? t('admin.confirmZone', { name: confirmDelete.name })
                : confirmDelete.type === 'experience'
                ? t('admin.confirmExperience', { name: confirmDelete.name })
                : t('admin.confirmUser', { name: confirmDelete.name })}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {confirmDelete.type === 'experience'
                ? t('admin.experienceDeleteWarning')
                : t('admin.softDeleteWarning')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                {t('admin.cancel')}
              </button>
              <button onClick={() => {
                if (confirmDelete.type === 'zone') handleDeleteZone(confirmDelete.id);
                else if (confirmDelete.type === 'experience') handleDeleteExperience(confirmDelete.id);
                else handleDeleteUser(confirmDelete.id);
              }} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                {confirmDelete.type === 'experience' ? t('admin.delete') : t('admin.deactivate')}
              </button>
            </div>
            {confirmDelete.type === 'user' && (
              <button onClick={() => handleHardDeleteUser(confirmDelete.id)} className="w-full mt-3 px-4 py-2 bg-red-800/50 hover:bg-red-800/70 text-red-300 border border-red-800/50 rounded-lg transition-colors text-sm">
                {t('admin.deletePermanently')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
