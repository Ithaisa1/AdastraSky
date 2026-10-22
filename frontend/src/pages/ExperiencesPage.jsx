import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Camera, Sparkles, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ExperienceCard from '../components/ExperienceCard';
import ExperienceForm from '../components/ExperienceForm';
import { santuariosData } from '../data/santuariosData';
import { API_URL } from '../config/api';


const ExperiencesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const zoneMap = {};
  santuariosData.forEach(z => { zoneMap[z.id] = z; });

  const fetchExperiences = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch(`${API_URL}/api/experiences?limit=50`);
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(String(res.status));
      setExperiences(Array.isArray(data.data?.experiences) ? data.data.experiences : []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const handleDelete = (id) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handleZoneClick = (zoneId) => {
    navigate('/map', { state: { selectedZone: zoneId } });
  };

  const handleCreated = (newExp) => {
    setExperiences(prev => [newExp, ...prev]);
  };

  const totalPhotos = experiences.reduce((sum, e) => sum + (e.images?.length || 0), 0);

  return (
    <div className="h-screen w-full flex bg-deepSpace overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-gradient-dashboard p-3 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <Camera className="w-7 h-7 text-astroAccent" aria-hidden="true" />
                {t('experiences.title')}
              </h1>
              <p className="text-gray-400 mt-1">
                {t('experiences.subtitle')}
              </p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl transition-all duration-300 shadow-lg shadow-astroAccent/30 whitespace-nowrap">
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('experiences.share')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-card rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-astroAccent/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-astroAccent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{experiences.length}</p>
                  <p className="text-xs text-gray-400">{t('experiences.statsExperiences')}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-solarFlare/20 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-solarFlare" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalPhotos}</p>
                  <p className="text-xs text-gray-400">{t('experiences.statsPhotos')}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-auroraGreen/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-auroraGreen" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(experiences.map(e => e.zone_id)).size}
                  </p>
                  <p className="text-xs text-gray-400">{t('experiences.statsLocations')}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label={t('common.loading')}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-astroCard/50 rounded-xl border border-white/5 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-astroDark" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-astroAccent/20 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/10 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-20" role="alert">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-gray-300 mb-4">{t('experiences.loadError')}</p>
              <button onClick={() => { setLoading(true); fetchExperiences(); }}
                className="px-5 py-2 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl">{t('errors.retry')}</button>
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-astroAccent/20 to-cosmicPurple/20 border border-astroAccent/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-astroAccent" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t('experiences.noExperiences')}</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {t('experiences.beFirst')}
              </p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl transition-all duration-300 shadow-lg shadow-astroAccent/30">
                <Camera className="w-4 h-4" aria-hidden="true" />
                {t('experiences.shareMine')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiences.map(exp => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  onDelete={handleDelete}
                  onZoneClick={handleZoneClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <ExperienceForm onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </div>
  );
};

export default ExperiencesPage;
