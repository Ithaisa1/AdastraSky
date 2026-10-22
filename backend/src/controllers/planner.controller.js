/**
 * Planificador astronómico: proxy hacia el ai-service (POST /api/planner).
 * El cálculo (efemérides + previsión + zonas) se hace en el ai-service.
 */

import { aiPost } from '../utils/aiClient.js';
import { sendAiError } from '../utils/aiErrors.js';

const LANGS = ['es', 'en', 'de'];
const WHEN = ['tonight', 'tomorrow', 'weekend', 'week'];

export const planObservation = async (req, res, next) => {
  try {
    const { target, when, start_date, days, latitude, longitude, island, max_distance_km } = req.body || {};
    if (!target || typeof target !== 'string' || target.length > 100) {
      return res.status(400).json({ status: 'error', code: 'INVALID_TARGET', message: 'Indica qué quieres observar' });
    }
    const body = {
      target: target.trim(),
      language: LANGS.includes(req.body.language) ? req.body.language : 'es',
      ...(WHEN.includes(when) && { when }),
      ...(typeof start_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(start_date) && { start_date }),
      ...(Number.isInteger(days) && { days }),
      ...(Number.isFinite(latitude) && Number.isFinite(longitude) && { latitude, longitude }),
      ...(typeof island === 'string' && island && { island }),
      ...(Number.isFinite(max_distance_km) && { max_distance_km })
    };
    try {
      const { data } = await aiPost('/api/planner', body, 60000);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      if (sendAiError(error, res)) return;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
