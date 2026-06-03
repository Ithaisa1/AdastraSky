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
        title: 'Adastra',
        placeholder: 'Pregunta sobre los cielos de Canarias...',
        thinking: 'Pensando...',
        send: 'Enviar',
      },
      // Calendario
      calendar: {
        title: 'Calendario Astronómico',
        subtitle: 'Eventos astronómicos y reservas en observatorios',
        today: 'Hoy',
        eventsIn: 'Eventos en',
        loading: 'Cargando eventos...',
        noEvents: 'No hay eventos este mes',
        tabCalendar: 'Calendario',
        tabReservas: 'Reservas',
        apodTitle: 'Astronomy Picture of the Day (NASA)',
      },
      // Reservas
      reservas: {
        title: 'Reservar Visita a los Observatorios',
        subtitle: 'Los observatorios del IAC en Canarias ofrecen visitas guiadas. Las reservas se gestionan directamente a través de las plataformas oficiales.',
        bookVisit: 'Reservar Visita',
        officialWeb: 'Web Oficial',
        moreInfo: 'Más información',
        lessInfo: 'Menos info',
        importantTitle: 'Información Importante',
        suspended: 'Las visitas a ambos observatorios quedan suspendidas entre diciembre y marzo por condiciones meteorológicas adversas.',
        accessTeide: 'El acceso al Observatorio del Teide requiere permiso del IAC (gestionado en la reserva).',
        accessORM: 'Para el ORM (La Palma), la carretera es de alta montaña. Se recomienda consultar el estado meteorológico antes de viajar.',
        jppaa: 'Las plazas para las Jornadas de Puertas Abiertas del Teide (20-21 junio 2026) se agotan en horas. Inscripción desde el 1 de junio a las 10:00.',
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
        title: 'Adastra',
        placeholder: 'Ask about the skies of the Canary Islands...',
        thinking: 'Thinking...',
        send: 'Send',
      },
      calendar: {
        title: 'Astronomical Calendar',
        subtitle: 'Astronomical events and observatory bookings',
        today: 'Today',
        eventsIn: 'Events in',
        loading: 'Loading events...',
        noEvents: 'No events this month',
        tabCalendar: 'Calendar',
        tabReservas: 'Bookings',
        apodTitle: 'Astronomy Picture of the Day (NASA)',
      },
      reservas: {
        title: 'Book a Visit to the Observatories',
        subtitle: 'The IAC observatories in the Canary Islands offer guided tours. Bookings are managed directly through the official platforms.',
        bookVisit: 'Book a Visit',
        officialWeb: 'Official Website',
        moreInfo: 'More info',
        lessInfo: 'Less info',
        importantTitle: 'Important Information',
        suspended: 'Visits to both observatories are suspended between December and March due to adverse weather conditions.',
        accessTeide: 'Access to Teide Observatory requires IAC permission (managed during booking).',
        accessORM: 'For ORM (La Palma), the road is high mountain. Check weather conditions before traveling.',
        jppaa: 'Spots for the Teide Open Days (June 20-21, 2026) sell out in hours. Registration opens June 1 at 10:00.',
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
        title: 'Adastra',
        placeholder: 'Fragen Sie nach dem Himmel der Kanarischen Inseln...',
        thinking: 'Denken...',
        send: 'Senden',
      },
      calendar: {
        title: 'Astronomischer Kalender',
        subtitle: 'Astronomische Ereignisse und Observatoriumsbuchungen',
        today: 'Heute',
        eventsIn: 'Ereignisse in',
        loading: 'Ereignisse werden geladen...',
        noEvents: 'Keine Ereignisse diesen Monat',
        tabCalendar: 'Kalender',
        tabReservas: 'Buchungen',
        apodTitle: 'Astronomiebild des Tages (NASA)',
      },
      reservas: {
        title: 'Besuch der Observatorien buchen',
        subtitle: 'Die IAC-Observatorien auf den Kanarischen Inseln bieten Führungen an. Buchungen werden direkt über die offiziellen Plattformen verwaltet.',
        bookVisit: 'Besuch buchen',
        officialWeb: 'Offizielle Website',
        moreInfo: 'Mehr Info',
        lessInfo: 'Weniger Info',
        importantTitle: 'Wichtige Informationen',
        suspended: 'Besuche beider Observatorien sind von Dezember bis März aufgrund widriger Wetterbedingungen ausgesetzt.',
        accessTeide: 'Der Zugang zum Teide-Observatorium erfordert eine IAC-Genehmigung (bei der Buchung geregelt).',
        accessORM: 'Für das ORM (La Palma) ist die Straße eine Hochgebirgsstraße. Überprüfen Sie die Wetterbedingungen vor der Reise.',
        jppaa: 'Die Plätze für die Teide-Tage der offenen Tür (20.-21. Juni 2026) sind in Stunden ausverkauft. Anmeldung ab 1. Juni um 10:00 Uhr.',
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
