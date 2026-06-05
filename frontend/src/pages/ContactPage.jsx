/**
 * AdastraSky Frontend - Página de Contacto
 * Formulario de contacto y información de contacto
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Mail, Phone, MapPin, Send, Star, Globe } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.length < 2) errs.name = t('contact.nameError', 'Mínimo 2 caracteres');
    if (!formData.email || !EMAIL_RE.test(formData.email)) errs.email = t('contact.emailError', 'Email inválido');
    if (!formData.subject) errs.subject = 'Selecciona un asunto';
    if (!formData.message || formData.message.length < 10) errs.message = 'Mínimo 10 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adastra_session');
      await axios.post(
        `${API_URL}/api/contact`,
        formData,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setSubmitSuccess(true);
      setErrors({});
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setSubmitError('');
  };

  return (
    <div className="min-h-screen w-full bg-astroDark flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-3">
        {/* Header */}
        <div className="bg-astroCard/50 backdrop-blur-lg border-b border-white/10 p-6">
          <h1 className="text-3xl font-bold text-white">{t('contact.title')}</h1>
          <p className="text-gray-400 mt-1">{t('contact.subtitle')}</p>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información de Contacto */}
            <div className="space-y-6">
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{t('contact.title')}</h2>
                <p className="text-gray-400 mb-6">
                  {t('contact.subtitle')}
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-astroAccent" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Email</h3>
                      <p className="text-gray-400 text-sm">contacto@adastrasky.com</p>
                      <p className="text-gray-400 text-sm">soporte@adastrasky.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-astroAccent" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Teléfono</h3>
                      <p className="text-gray-400 text-sm">+34 922 123 456</p>
                      <p className="text-gray-400 text-sm">Lun - Vie: 9:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-astroAccent" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Ubicación</h3>
                      <p className="text-gray-400 text-sm">Instituto de Astrofísica de Canarias</p>
                      <p className="text-gray-400 text-sm">C/ Vía Láctea, s/n</p>
                      <p className="text-gray-400 text-sm">38205 San Cristóbal de La Laguna, España</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Sobre Adastra Sky</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Adastra Sky es una plataforma dedicada a promover la calidad astronómica de las Islas Canarias, 
                  conectando a entusiastas de la astronomía con los mejores lugares para observar el firmamento.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Star className="w-4 h-4 text-astroAccent" />
                    <span>42+ Santuarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Globe className="w-4 h-4 text-astroAccent" />
                    <span>8 Islas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{t('contact.title')}</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">{t('contact.success')}</p>
                </div>
              )}
              {submitError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                    placeholder="Tu nombre"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Asunto
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="general">Consulta General</option>
                    <option value="observatories">Información sobre Observatorios</option>
                    <option value="events">Eventos Astronómicos</option>
                    <option value="technical">Problema Técnico</option>
                    <option value="account">Problema con la Cuenta</option>
                    <option value="collaboration">Colaboración</option>
                    <option value="other">Otro</option>
                  </select>
                  {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs">
                  Al enviar este formulario, aceptas nuestra política de privacidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
