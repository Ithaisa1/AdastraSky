/**
 * AdastraSky Frontend - Home Espacial Pre-Login
 * Landing Page de bienvenida
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fondo Visual - Cielo estrellado sobre las Islas Canarias */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=2072&auto=format&fit=crop')`,
          opacity: 0.75,
        }}
      >
        {/* Degradado oscuro en la base para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/80 via-transparent to-[#0B0F19]" />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center px-4">
        {/* Logotipo Textual */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider">
            ADASTRA <span className="font-light text-indigo-400">SKY</span>
          </h1>
        </div>

        {/* Título Principal */}
        <h2 className="text-3xl md:text-5xl font-sans text-white text-center mb-6 leading-tight">
          {t('home.heroTitle')}
        </h2>

        {/* Subtítulo Descriptivo */}
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-4xl leading-relaxed">
          {t('home.heroSubtitle')}
        </p>

        {/* Botón Central Prominente */}
        <button
          onClick={handleEnterApp}
          className="relative z-50 group flex items-center gap-3 px-8 py-4 bg-[#151D30]/90 hover:bg-[#151D30] border border-indigo-400/30 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        >
          <LogIn className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-sans text-lg">
            {t('home.startExploring')}
          </span>
        </button>

        {/* Información Adicional */}
        <div className="absolute bottom-8 text-center">
          <p className="text-gray-400 text-xs font-mono tracking-wider">
            Canary Islands Observatory Network
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
