import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Home, Star } from 'lucide-react';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-astroDark flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <Star className="w-24 h-24 text-astroAccent/30 mx-auto animate-glow-pulse" />
          <Star className="w-8 h-8 text-astroAccent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">{t('notFound.message', 'Esta página no existe en el universo conocido')}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/80 text-white rounded-lg transition-all font-medium"
        >
          <Home className="w-5 h-5" />
          {t('notFound.goHome', 'Volver al inicio')}
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
