import { useState } from 'react';
import { MapPin, Clock, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://aadastra-sky-backend.onrender.com';

const ExperienceCard = ({ experience, onDelete, onZoneClick }) => {
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const images = experience.images || [];
  const date = new Date(experience.created_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const isOwner = user?.id === experience.user_id;

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta experiencia?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('adastra_session');
      await fetch(`${API_URL}/api/experiences/${experience.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete?.(experience.id);
    } catch {
      alert('Error al eliminar la experiencia');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-astroCard/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden hover:border-astroAccent/30 transition-all duration-300 group">
      {images.length > 0 ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-astroDark">
          <img
            src={images[currentImage].startsWith('http') ? images[currentImage] : `${API_URL}${images[currentImage]}`}
            alt={experience.title}
            className="w-full h-full object-contain bg-astroDark transition-transform duration-500 md:group-hover:scale-105"
          />
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-1 md:px-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                className="p-2 md:p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow-lg">
                <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
              </button>
              <button onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                className="p-2 md:p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow-lg">
                <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {currentImage + 1}/{images.length}
          </div>
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-astroDark via-astroCard to-astroDark flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-600" />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-astroAccent to-cosmicPurple flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{getInitials(experience.author?.first_name)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {experience.author?.first_name} {experience.author?.last_name}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {date}
              </p>
            </div>
          </div>
          {isOwner && (
            <button onClick={handleDelete} disabled={deleting}
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h4 className="text-base font-semibold text-white">{experience.title}</h4>
        {experience.description && (
          <p className="text-sm text-gray-400 line-clamp-3">{experience.description}</p>
        )}

        <button onClick={() => onZoneClick?.(experience.zone_id)}
          className="flex items-center gap-1.5 text-xs text-astroAccent hover:text-astroAccent/80 transition-colors">
          <MapPin className="w-3.5 h-3.5" />
          Ver ubicación
        </button>
      </div>
    </div>
  );
};

export default ExperienceCard;
