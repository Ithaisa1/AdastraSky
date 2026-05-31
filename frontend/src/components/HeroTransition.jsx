/**
 * AdastraSky Frontend - Transición Hero Post-Login
 * Animación de zoom-in hacia las Islas Canarias iluminadas
 */

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HeroTransition = () => {
  const { showHeroTransition, completeHeroTransition } = useAuth();

  useEffect(() => {
    if (showHeroTransition) {
      const timer = setTimeout(() => {
        completeHeroTransition();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showHeroTransition, completeHeroTransition]);

  if (!showHeroTransition) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-astroDark">
      {/* Imagen de satélite nocturno de las Islas Canarias */}
      <div
        className="absolute inset-0 animate-zoom-hero"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Capa de gradiente para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-astroDark/80 via-transparent to-astroDark/60" />

      {/* Texto estilizado con tipografía serif */}
      <div className="relative z-10 text-center px-4">
        <div className="animate-zoom-hero">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 drop-shadow-2xl">
            Aproximación Estelar...
          </h1>
          <p className="text-xl md:text-2xl font-serif text-gray-200 drop-shadow-xl">
            Conectando con los Cielos de Canarias
          </p>
        </div>

        {/* Indicador de carga */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-astroAccent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-astroAccent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-astroAccent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroTransition;
