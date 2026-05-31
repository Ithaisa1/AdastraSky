/**
 * AdastraSky Frontend - Configuración i18next
 * Soporte multiidioma: ES, EN, DE
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Recursos de traducción
const resources = {
  es: {
    translation: {
      // Login / Registro
      login: {
        title: 'Adastra Sky',
        subtitle: 'Explora los Cielos de Canarias',
        email: 'Correo electrónico',
        password: 'Contraseña',
        loginButton: 'Iniciar Sesión',
        registerButton: 'Registrarse',
        noAccount: '¿No tienes cuenta?',
        hasAccount: '¿Ya tienes cuenta?',
        atmosphere: 'Densidad Atmosférica',
      },
      // Dashboard
      dashboard: {
        title: 'Santuarios Estelares',
        search: 'Buscar santuario...',
        allIslands: 'Todas las Islas',
        observatories: 'Observatorios',
        astronomicalViewpoints: 'Miradores Astronómicos',
        landscapeViewpoints: 'Miradores Paisajísticos',
      },
      // Categorías
      categories: {
        observatory: 'Observatorio Astronómico',
        astronomical_viewpoint: 'Mirador Astronómico',
        landscape_viewpoint: 'Mirador Paisajístico',
      },
      // Ficha Técnica
      sanctuary: {
        realImage: 'Imagen Real',
        live: 'EN DIRECTO',
        altitude: 'Altitud',
        accessibility: 'Accesibilidad',
        weather: 'Meteorología',
        temperature: 'Temperatura',
        cloudiness: 'Nubosidad',
        wind: 'Viento',
        visibility: 'Visibilidad',
        humidity: 'Humedad',
        skyQuality: 'Calidad del Cielo',
        bortleScale: 'Escala Bortle',
        seeing: 'Seeing',
        lightPollution: 'Contaminación Lumínica',
        sources: 'Fuentes Consultadas',
        loading: 'Cargando',
      },
      // Chat
      chat: {
        title: 'Asistente Astronómico',
        placeholder: 'Pregunta sobre los cielos de Canarias...',
        thinking: 'Pensando...',
        send: 'Enviar',
      },
      // General
      common: {
        back: 'Volver',
        close: 'Cerrar',
        save: 'Guardar',
        cancel: 'Cancelar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
      },
    },
  },
  en: {
    translation: {
      login: {
        title: 'Adastra Sky',
        subtitle: 'Explore the Skies of the Canary Islands',
        email: 'Email',
        password: 'Password',
        loginButton: 'Login',
        registerButton: 'Register',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        atmosphere: 'Atmospheric Density',
      },
      dashboard: {
        title: 'Stellar Sanctuaries',
        search: 'Search sanctuary...',
        allIslands: 'All Islands',
        observatories: 'Observatories',
        astronomicalViewpoints: 'Astronomical Viewpoints',
        landscapeViewpoints: 'Landscape Viewpoints',
      },
      categories: {
        observatory: 'Astronomical Observatory',
        astronomical_viewpoint: 'Astronomical Viewpoint',
        landscape_viewpoint: 'Landscape Viewpoint',
      },
      sanctuary: {
        realImage: 'Real Image',
        live: 'LIVE',
        altitude: 'Altitude',
        accessibility: 'Accessibility',
        weather: 'Weather',
        temperature: 'Temperature',
        cloudiness: 'Cloudiness',
        wind: 'Wind',
        visibility: 'Visibility',
        humidity: 'Humidity',
        skyQuality: 'Sky Quality',
        bortleScale: 'Bortle Scale',
        seeing: 'Seeing',
        lightPollution: 'Light Pollution',
        sources: 'Sources Consulted',
        loading: 'Loading',
      },
      chat: {
        title: 'Astronomical Assistant',
        placeholder: 'Ask about the skies of the Canary Islands...',
        thinking: 'Thinking...',
        send: 'Send',
      },
      common: {
        back: 'Back',
        close: 'Close',
        save: 'Save',
        cancel: 'Cancel',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
      },
    },
  },
  de: {
    translation: {
      login: {
        title: 'Adastra Sky',
        subtitle: 'Erkunden Sie den Himmel der Kanarischen Inseln',
        email: 'E-Mail',
        password: 'Passwort',
        loginButton: 'Anmelden',
        registerButton: 'Registrieren',
        noAccount: 'Haben Sie kein Konto?',
        hasAccount: 'Haben Sie bereits ein Konto?',
        atmosphere: 'Atmosphärendichte',
      },
      dashboard: {
        title: 'Sternheiligtümer',
        search: 'Heiligtum suchen...',
        allIslands: 'Alle Inseln',
        observatories: 'Observatorien',
        astronomicalViewpoints: 'Astronomische Aussichtspunkte',
        landscapeViewpoints: 'Landschaftsaussichtspunkte',
      },
      categories: {
        observatory: 'Astronomisches Observatorium',
        astronomical_viewpoint: 'Astronomischer Aussichtspunkt',
        landscape_viewpoint: 'Landschaftsaussichtspunkt',
      },
      sanctuary: {
        realImage: 'Echtes Bild',
        live: 'LIVE',
        altitude: 'Höhe',
        accessibility: 'Zugänglichkeit',
        weather: 'Wetter',
        temperature: 'Temperatur',
        cloudiness: 'Bewölkung',
        wind: 'Wind',
        visibility: 'Sichtweite',
        humidity: 'Feuchtigkeit',
        skyQuality: 'Himmelqualität',
        bortleScale: 'Bortle-Skala',
        seeing: 'Seeing',
        lightPollution: 'Lichtverschmutzung',
        sources: 'Konsultierte Quellen',
        loading: 'Laden...',
      },
      chat: {
        title: 'Astronomischer Assistent',
        placeholder: 'Fragen Sie nach dem Himmel der Kanarischen Inseln...',
        thinking: 'Denken...',
        send: 'Senden',
      },
      common: {
        back: 'Zurück',
        close: 'Schließen',
        save: 'Speichern',
        cancel: 'Abbrechen',
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
