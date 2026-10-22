import { generateEventsForYear, generateEventsForMonth } from '../utils/astronomyEvents.js';

/**
 * GET /api/events
 * Query params: month, year, type, lang (es|en|de)
 * Fuente: cálculo con Astronomy Engine (efemérides) + longitudes solares de la IMO
 */
export async function getAllEvents(req, res) {
  try {
    const { month, year, type } = req.query;
    const lang = ['es', 'en', 'de'].includes(req.query.lang) ? req.query.lang : 'es';
    const parsedYear = parseInt(year, 10);
    const targetYear = parsedYear >= 1900 && parsedYear <= 2200 ? parsedYear : new Date().getFullYear();
    const parsedMonth = parseInt(month, 10);
    if (month && !(parsedMonth >= 1 && parsedMonth <= 12)) {
      return res.status(400).json({ success: false, error: 'Mes inválido (1-12)' });
    }

    let events;
    if (month) {
      const targetMonth = parsedMonth;
      events = generateEventsForMonth(targetYear, targetMonth, lang);

      if (targetMonth === 12) {
        const nextMonth = generateEventsForMonth(targetYear + 1, 1, lang);
        events = events.concat(nextMonth);
      } else if (targetMonth === 1) {
        const prevMonth = generateEventsForMonth(targetYear - 1, 12, lang);
        events = prevMonth.concat(events);
      }
    } else {
      events = generateEventsForYear(targetYear, lang);
    }

    if (type && type !== 'all') {
      events = events.filter(e => e.type === type);
    }

    res.json({ success: true, count: events.length, data: events, source: 'astronomy_engine_imo' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener eventos astronómicos' });
  }
}

/**
 * GET /api/events/nasa/apod
 * Fuente: NASA Astronomy Picture of the Day API
 */
export async function getNasaApod(req, res) {
  try {
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=5`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await response.json();
    if (data.error) {
      return res.json({ success: true, data: [] });
    }
    res.json({ success: true, data: Array.isArray(data) ? data : [data] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener imagen astronómica del día' });
  }
}

// Mantenido por compatibilidad, ya no requiere DB
export async function seedEvents(req, res) {
  res.json({ success: true, message: 'Los eventos se generan dinámicamente. No requiere seed.', count: 0 });
}
