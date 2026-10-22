/**
 * AdastraSky Frontend - Página de Contacto
 * Formulario de contacto y información de contacto
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Mail, Send, Star, Globe } from 'lucide-react';
import { santuariosData } from '../data/santuariosData';
import { API_URL } from '../config/api';


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Correo público de contacto (opcional). Si no se define, solo se muestra el formulario.
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';

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
    if (!formData.name || formData.name.length < 2) errs.name = t('contact.nameError');
    if (!formData.email || !EMAIL_RE.test(formData.email)) errs.email = t('contact.emailError');
    if (!formData.subject) errs.subject = t('contact.subjectError');
    if (!formData.message || formData.message.length < 10) errs.message = t('contact.messageError');
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
      await axios.post(`${API_URL}/api/contact`, formData);
      setSubmitSuccess(true);
      setErrors({});
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.response?.status === 429 ? t('contact.rateLimited') : t('contact.sendError'));
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
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
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
                <h2 className="text-2xl font-bold text-white mb-4">{t('contact.infoTitle')}</h2>
                <p className="text-gray-400 mb-6">{t('contact.infoText')}</p>
                {CONTACT_EMAIL && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-astroDark/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-astroAccent" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">{t('contact.email')}</h3>
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-300 text-sm underline hover:text-white">{CONTACT_EMAIL}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Información Adicional */}
              <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">{t('contact.aboutTitle')}</h3>
                <p className="text-gray-400 text-sm mb-4">{t('contact.aboutText')}</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Star className="w-4 h-4 text-astroAccent" aria-hidden="true" />
                    <span>{t('contact.sanctuariesCount', { count: santuariosData.length })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Globe className="w-4 h-4 text-astroAccent" aria-hidden="true" />
                    <span>{t('contact.islandsCount', { count: 8 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-astroCard/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{t('contact.formTitle')}</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg" role="status">
                  <p className="text-green-400 text-sm">{t('contact.success')}</p>
                </div>
              )}
              {submitError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert">
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('contact.name')}
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                    placeholder={t('login.firstNamePlaceholder')}
                  />
                  {errors.name && <p id="contact-name-error" className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('contact.email')}
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                    placeholder={t('login.emailPlaceholder')}
                  />
                  {errors.email && <p id="contact-email-error" className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('contact.subject')}
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors"
                  >
                    <option value="">{t('contact.subjects.choose')}</option>
                    <option value="general">{t('contact.subjects.general')}</option>
                    <option value="observatories">{t('contact.subjects.observatories')}</option>
                    <option value="events">{t('contact.subjects.events')}</option>
                    <option value="technical">{t('contact.subjects.technical')}</option>
                    <option value="account">{t('contact.subjects.account')}</option>
                    <option value="collaboration">{t('contact.subjects.collaboration')}</option>
                    <option value="other">{t('contact.subjects.other')}</option>
                  </select>
                  {errors.subject && <p id="contact-subject-error" className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-astroDark/50 border border-white/10 rounded-lg text-white focus:border-astroAccent focus:outline-none transition-colors resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                  {errors.message && <p id="contact-message-error" className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden="true" />
                      <span>{t('contact.send')}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs">
                  {t('contact.privacy')}
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
