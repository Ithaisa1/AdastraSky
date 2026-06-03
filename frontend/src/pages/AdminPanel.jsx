import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Plus, Trash2, Edit3, Shield, Database, Activity, AlertTriangle,
  X, Save, Search, Users, MapPin, ToggleLeft, ToggleRight, ArrowUp, ArrowDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  const [confirmDelete, setConfirmDelete] = useState(null);

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchZones = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/zones`, getAuthHeaders());
      setZones(res.data.data.zones);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar zonas');
    }
  }, [getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, getAuthHeaders());
      setUsers(res.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (role !== 'admin') return;
    setLoading(true);
    Promise.all([fetchZones(), fetchUsers()]).finally(() => setLoading(false));
  }, [role, fetchZones, fetchUsers]);

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
      setError(err.response?.data?.message || 'Error al guardar zona');
    }
  };

  const handleDeleteZone = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/zones/${id}`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar zona');
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
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al desactivar usuario');
    }
  };

  const handleHardDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}/hard`, getAuthHeaders());
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
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
          <h1 className="text-4xl font-bold text-red-500 mb-4">ACCESO DENEGADO</h1>
          <p className="text-xl text-gray-300 mb-2">SE REQUIEREN CREDENCIALES DE ADMINISTRADOR</p>
          <p className="text-sm text-gray-500 mb-8">Esta área está restringida a personal autorizado.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-astroDark flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <div className="bg-astroCard border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
              <p className="text-gray-400">Gestión de zonas astronómicas y usuarios del sistema</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-astroAccent" />
                <span className="text-gray-400 text-sm">Total Zonas</span>
              </div>
              <p className="text-3xl font-bold text-white">{zones.length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Observatorios</span>
              </div>
              <p className="text-3xl font-bold text-white">{zones.filter(z => z.category === 'observatory').length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400 text-sm">Usuarios</span>
              </div>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-astroCard rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">Administradores</span>
              </div>
              <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            <button onClick={() => { setActiveTab('zones'); setSearch(''); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'zones' ? 'bg-astroAccent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <MapPin className="w-4 h-4" /> Zonas
            </button>
            <button onClick={() => { setActiveTab('users'); setSearch(''); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-astroAccent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <Users className="w-4 h-4" /> Usuarios
            </button>
          </div>

          <div className="bg-astroCard rounded-lg border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text" placeholder={activeTab === 'zones' ? 'Buscar zonas...' : 'Buscar usuarios...'}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-astroAccent/50"
                />
              </div>
              {activeTab === 'zones' && (
                <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors text-sm">
                  <Plus className="w-4 h-4" /> Nueva Zona
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">Cargando...</div>
            ) : activeTab === 'zones' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-astroDark/50">
                    <tr>
                      {[
                        { key: 'name', label: 'Nombre' },
                        { key: 'island', label: 'Isla' },
                        { key: 'category', label: 'Categoría' },
                        { key: 'bortle_scale', label: 'Bortle' },
                        { key: 'altitude', label: 'Altitud' },
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
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Activo</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredZones.map(zone => (
                      <tr key={zone.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-white">{zone.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{zone.island}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded border bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {zone.category === 'observatory' ? 'Observatorio' : zone.category === 'astronomical_viewpoint' ? 'Mirador Astro' : 'Mirador Paisaje'}
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
                            {zone.is_active !== false ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEditModal(zone)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'zone', id: zone.id, name: zone.name })} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title="Desactivar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredZones.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No se encontraron zonas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-astroDark/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Rol</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Activo</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Idioma</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Último Login</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-medium text-gray-400 uppercase">Acciones</th>
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
                            {u.is_active ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{u.preferred_language}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Nunca'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEditUserModal(u)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'user', id: u.id, name: `${u.first_name} ${u.last_name}` })} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title="Desactivar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No se encontraron usuarios</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingZone ? 'Editar Zona' : 'Nueva Zona'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Isla *</label>
                <select name="island" value={formData.island} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  {ISLANDS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Municipio</label>
                <input name="municipality" value={formData.municipality} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Categoría *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Subcategoría</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  <option value="">--</option>
                  {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Latitud *</label>
                <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Longitud *</label>
                <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Altitud (m) *</label>
                <input name="altitude" type="number" value={formData.altitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Escala Bortle (1-9) *</label>
                <input name="bortle_scale" type="number" min="1" max="9" value={formData.bortle_scale} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tipo de Acceso</label>
                <select name="access_type" value={formData.access_type} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50">
                  {ACCESS_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Riesgo de Seguridad (1-5)</label>
                <input name="safety_risk" type="number" min="1" max="5" value={formData.safety_risk} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">URL de Imagen</label>
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
                Cancelar
              </button>
              <button onClick={handleSaveZone} className="flex-1 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {editingZone ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowUserModal(false)}>
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                <input value={userForm.first_name} onChange={e => setUserForm({ ...userForm, first_name: e.target.value })} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Apellido</label>
                <input value={userForm.last_name} onChange={e => setUserForm({ ...userForm, last_name: e.target.value })} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2 bg-astroDark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-astroAccent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rol</label>
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
                <label className="block text-xs text-gray-400 mb-1">Estado</label>
                <button onClick={() => setUserForm({ ...userForm, is_active: !userForm.is_active })} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userForm.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {userForm.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {userForm.is_active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUserModal(false)} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={handleSaveUser} className="flex-1 px-4 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-astroCard rounded-lg border border-white/10 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">Confirmar</h3>
            </div>
            <p className="text-gray-300 mb-2">
              {confirmDelete.type === 'zone'
                ? `¿Desactivar la zona "${confirmDelete.name}"?`
                : `¿Desactivar al usuario "${confirmDelete.name}"?`}
            </p>
            <p className="text-gray-500 text-sm mb-6">El elemento quedará oculto pero no se eliminará permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={() => confirmDelete.type === 'zone' ? handleDeleteZone(confirmDelete.id) : handleDeleteUser(confirmDelete.id)} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                Desactivar
              </button>
            </div>
            {confirmDelete.type === 'user' && (
              <button onClick={() => handleHardDeleteUser(confirmDelete.id)} className="w-full mt-3 px-4 py-2 bg-red-800/50 hover:bg-red-800/70 text-red-300 border border-red-800/50 rounded-lg transition-colors text-sm">
                Eliminar permanentemente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
