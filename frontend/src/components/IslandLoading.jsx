/**
 * AdastraSky Frontend - Micro-Loading Temático
 * Skeleton loader con silueta de la isla seleccionada
 */

import { useTranslation } from 'react-i18next';

const IslandLoading = ({ islandName }) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-astroCard">
      {/* Silueta de isla parpadeante */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-astroAccent/20 animate-pulse-island flex items-center justify-center">
          <div className="text-6xl">🏝️</div>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-astroAccent/30 animate-ping" />
      </div>

      {/* Texto de carga */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-white animate-pulse">
          {t('sanctuary.loading')} {islandName}...
        </h3>
        <p className="text-gray-400">
          Consultando datos astronómicos y meteorológicos
        </p>

        {/* Indicador de progreso */}
        <div className="w-64 h-2 bg-astroDark rounded-full overflow-hidden">
          <div className="h-full bg-astroAccent animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>

      {/* Iconos de carga temáticos */}
      <div className="mt-8 flex space-x-6 text-gray-500">
        <div className="animate-pulse">
          <div className="text-2xl mb-1">🌡️</div>
          <div className="text-xs">Temperatura</div>
        </div>
        <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>
          <div className="text-2xl mb-1">☁️</div>
          <div className="text-xs">Nubosidad</div>
        </div>
        <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>
          <div className="text-2xl mb-1">🌌</div>
          <div className="text-xs">Cielo</div>
        </div>
      </div>
    </div>
  );
};

export default IslandLoading;
