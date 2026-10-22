/**
 * AdastraSky Frontend - Configuración i18next
 * Soporte multiidioma: ES, EN, DE
 *
 * Las traducciones viven en src/locales/{es,en,de}.json.
 * El test src/__tests__/i18n.test.js comprueba que los tres idiomas tienen
 * exactamente las mismas claves (ningún texto queda sin traducir).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from '../locales/es.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

export const SUPPORTED_LANGUAGES = ['es', 'en', 'de'];

const resources = {
  es: { translation: es },
  en: { translation: en },
  de: { translation: de },
};

const savedLanguage = (() => {
  try {
    const l = localStorage.getItem('adastra.language');
    return SUPPORTED_LANGUAGES.includes(l) ? l : null;
  } catch {
    return null;
  }
})();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('adastra.language', lng);
  } catch {
    /* almacenamiento no disponible */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});

export default i18n;
