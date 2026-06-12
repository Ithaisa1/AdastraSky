import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Image, MapPin, Camera, ChevronDown } from 'lucide-react';
import { santuariosData } from '../data/santuariosData';
import CameraCapture from './CameraCapture';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://aadastra-sky-backend.onrender.com';

const ExperienceForm = ({ onClose, onCreated, initialZoneId }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoneId, setZoneId] = useState(initialZoneId || '');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [dropdownUp, setDropdownUp] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const fileRef = useRef(null);

  const handleClickOutside = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpenDropdown(false);
    }
  }, []);

  useEffect(() => {
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      const trigger = triggerRef.current;
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 280;
        setDropdownUp(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown, handleClickOutside]);

  const selectedZone = zoneId ? santuariosData.find(z => z.id === zoneId) : null;

  const groupedZones = {};
  santuariosData.forEach(z => {
    if (!groupedZones[z.island]) groupedZones[z.island] = [];
    groupedZones[z.island].push(z);
  });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const remaining = 5 - files.length;
    const toAdd = selected.slice(0, remaining);

    setFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleCameraCapture = (file) => {
    setFiles(prev => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => setPreviews(prev => [...prev, e.target.result]);
    reader.readAsDataURL(file);
    setShowCamera(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !zoneId) {
      setError('Completa el título y selecciona una ubicación');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('zone_id', zoneId);
      files.forEach(f => formData.append('images', f));

      const res = await fetch(`${API_URL}/api/experiences`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onCreated?.(data.data);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Error al publicar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-astroCard rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-astroCard/95 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Comparte tu experiencia</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Título</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Un atardecer inolvidable..."
                className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Descripción</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Cuenta tu experiencia en este lugar..."
                rows={3}
                className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors resize-none" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-astroAccent" />
                Ubicación
              </label>
              <div className="relative" ref={dropdownRef}>
                <button type="button" ref={triggerRef}
                  onClick={() => setOpenDropdown(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors">
                  <span className={selectedZone ? '' : 'text-gray-500'}>
                    {selectedZone ? `${selectedZone.name} (${selectedZone.island})` : 'Selecciona un lugar...'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown && (
                  <div className={`absolute z-50 left-0 right-0 bg-astroDark border border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto ${dropdownUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    <button type="button" onClick={() => { setZoneId(''); setOpenDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm ${!zoneId ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      Selecciona un lugar...
                    </button>
                    {Object.entries(groupedZones).map(([island, zones]) => (
                      <div key={island}>
                        <div className="px-4 py-1.5 text-xs text-gray-600 uppercase tracking-wider font-semibold bg-black/20">
                          {island}
                        </div>
                        {zones.map(z => (
                          <button key={z.id} type="button" onClick={() => { setZoneId(z.id); setOpenDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${zoneId === z.id ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                            {z.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Fotografías (máx. 5)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {previews.map((preview, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                    <img src={preview} alt="" className="w-full h-full object-contain bg-astroDark" />
                    <button type="button" onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {files.length < 5 && (
                  <>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-white/20 hover:border-astroAccent/50 flex items-center justify-center text-gray-500 hover:text-astroAccent transition-colors">
                      <Upload className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => setShowCamera(true)}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-astroAccent/30 hover:border-astroAccent/60 flex items-center justify-center text-astroAccent hover:text-astroAccent/80 transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> Subir archivos</span>
                <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> Tomar foto</span>
              </div>
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tiff,.tif,.raw,.cr2,.nef,.arw,.dng" multiple onChange={handleFileChange} className="hidden" />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <>Publicando...</>
              ) : (
                <><Image className="w-4 h-4" /> Publicar experiencia</>
              )}
            </button>
          </form>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default ExperienceForm;
