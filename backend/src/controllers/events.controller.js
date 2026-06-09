import { generateEventsForYear, generateEventsForMonth } from '../utils/astronomyEvents.js';

/**
 * GET /api/events
 * Query params: month, year, type
 * Fuente: Cálculos basados en datos orbitales NASA/JPL, IMO, NASA Eclipse Web Site
 */
export async function getAllEvents(req, res) {
  try {
    const { month, year, type } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    let events;
    if (month) {
      const targetMonth = parseInt(month);
      events = generateEventsForMonth(targetYear, targetMonth);

      if (targetMonth === 12) {
        const nextMonth = generateEventsForMonth(targetYear + 1, 1);
        events = events.concat(nextMonth);
      } else if (targetMonth === 1) {
        const prevMonth = generateEventsForMonth(targetYear - 1, 12);
        events = prevMonth.concat(events);
      }
    } else {
      events = generateEventsForYear(targetYear);
    }

    if (type && type !== 'all') {
      events = events.filter(e => e.type === type);
    }

    res.json({ success: true, count: events.length, data: events, source: 'nasa_jpl_imo' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=5`
    );
    const data = await response.json();
    if (data.error) {
      return res.json({ success: true, data: [] });
    }
    res.json({ success: true, data: Array.isArray(data) ? data : [data] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Mantenido por compatibilidad, ya no requiere DB
export async function seedEvents(req, res) {
  res.json({ success: true, message: 'Los eventos se generan dinámicamente. No requiere seed.', count: 0 });
}
