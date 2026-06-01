/**
 * AdastraSky Frontend - Página de Login/Registro Inmersiva
 * Fondo cinemático con Tierra rotando y control de opacidad atmosférica
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Globe } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^.{6,}$/;
const NAME_RE = /^.{2,}$/;

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [opacity, setOpacity] = useState(0.5);
  const [language, setLanguage] = useState('es');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.email || !EMAIL_RE.test(formData.email)) errs.email = 'Email inválido';
    if (!formData.password || !PASSWORD_RE.test(formData.password)) errs.password = 'Mínimo 6 caracteres';
    if (!isLogin) {
      if (!formData.firstName || !NAME_RE.test(formData.firstName)) errs.firstName = 'Mínimo 2 caracteres';
      if (!formData.lastName || !NAME_RE.test(formData.lastName)) errs.lastName = 'Mínimo 2 caracteres';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setIsLoading(true);

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setApiError(result.error);
      }
    } else {
      const result = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        language
      );
      if (!result.success) {
        setApiError(result.error);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-astroDark">
      {/* Fondo Cinemático Horizontal - Tierra desde el espacio con barrido panorámico */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop)',
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 50%',
          opacity: opacity,
          animation: 'panoramic-scan 30s ease-in-out infinite',
        }}
      />

      {/* Estilos CSS personalizados para la animación panorámica */}
      <style>{`
        @keyframes panoramic-scan {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      {/* Capa de gradiente para profundidad */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-astroDark/30 via-astroDark/50 to-astroDark/80"
        style={{ opacity: 0.7 }}
      />

      {/* Contenedor principal */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Selector de Idioma */}
          <div className="mb-8 flex justify-center gap-2">
            {['es', 'en', 'de'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  language === lang
                    ? 'bg-astroAccent text-white shadow-lg shadow-astroAccent/50'
                    : 'bg-astroCard/50 text-gray-300 hover:bg-astroCard/70'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Caja de Login/Registro */}
          <div
            className="bg-astroCard/85 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-8"
            style={{ opacity: 0.95 }}
          >
            {/* Encabezado */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-12 h-12 text-astroAccent mr-3" />
                <h1 className="text-4xl font-bold text-white">
                  {t('login.title')}
                </h1>
              </div>
              <p className="text-gray-300 text-lg">{t('login.subtitle')}</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-astroDark/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-astroAccent focus:ring-2 focus:ring-astroAccent/20 transition-all duration-300"
                      placeholder="Tu nombre"
                    />
                    {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-astroDark/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-astroAccent focus:ring-2 focus:ring-astroAccent/20 transition-all duration-300"
                      placeholder="Tu apellido"
                    />
                    {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-astroDark/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-astroAccent focus:ring-2 focus:ring-astroAccent/20 transition-all duration-300"
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-astroDark/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-astroAccent focus:ring-2 focus:ring-astroAccent/20 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {apiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{apiError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-astroAccent hover:bg-astroAccent/90 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-astroAccent/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? t('common.loading')
                  : isLogin
                  ? t('login.loginButton')
                  : t('login.registerButton')}
              </button>
            </form>

            {/* Toggle Login/Registro */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setApiError('');
                  setErrors({});
                }}
                className="text-astroAccent hover:text-astroAccent/80 transition-colors duration-300"
              >
                {isLogin ? t('login.noAccount') : t('login.hasAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Regulador Atmosférico Flotante - Parte Inferior Derecha */}
      <div className="absolute bottom-8 right-8 z-20 bg-astroCard/90 backdrop-blur-lg rounded-lg p-4 border border-white/10 shadow-xl">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Opacidad Atmosférica
        </label>
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-32 h-2 bg-astroCard rounded-lg appearance-none cursor-pointer accent-astroAccent"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10%</span>
          <span>{Math.round(opacity * 100)}%</span>
          <span>90%</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
