import SkyScore from '../models/SkyScore.js';
import SkyQualityZone from '../models/SkyQualityZone.js';
import { Op } from 'sequelize';

export const saveSkyScore = async (req, res, next) => {
  try {
    const {
      date, overall_score, astro_score, photo_score, tourism_score,
      avg_bortle, avg_cloudiness, avg_humidity, avg_wind_speed, avg_temperature,
      moon_phase, moon_illumination, avg_light_pollution, source, notes
    } = req.body;

    if (!date || overall_score === undefined || overall_score === null) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'date y overall_score son obligatorios'
      });
    }

    const [score, created] = await SkyScore.upsert({
      date,
      overall_score,
      astro_score: astro_score ?? null,
      photo_score: photo_score ?? null,
      tourism_score: tourism_score ?? null,
      avg_bortle: avg_bortle ?? null,
      avg_cloudiness: avg_cloudiness ?? null,
      avg_humidity: avg_humidity ?? null,
      avg_wind_speed: avg_wind_speed ?? null,
      avg_temperature: avg_temperature ?? null,
      moon_phase: moon_phase ?? null,
      moon_illumination: moon_illumination ?? null,
      avg_light_pollution: avg_light_pollution ?? null,
      source: source || 'n8n',
      notes: notes || null
    });

    res.status(created ? 201 : 200).json({
      status: 'success',
      message: created ? 'Sky Score creado' : 'Sky Score actualizado',
      data: { score }
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestSkyScore = async (req, res, next) => {
  try {
    const score = await SkyScore.findOne({
      order: [['date', 'DESC']]
    });

    if (!score) {
      const zones = await SkyQualityZone.findAll({ where: { is_active: true } });
      const avgBortle = zones.reduce((s, z) => s + z.bortle_scale, 0) / zones.length;
      const fallbackScore = Math.round(((9 - avgBortle) / 8) * 100) / 10;
      return res.status(200).json({
        status: 'success',
        data: {
          score: {
            overall_score: Math.round(fallbackScore * 10) / 10,
            astro_score: null,
            photo_score: null,
            tourism_score: null,
            avg_bortle: Math.round(avgBortle * 10) / 10,
            date: new Date().toISOString().split('T')[0],
            source: 'fallback'
          }
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { score }
    });
  } catch (error) {
    next(error);
  }
};

export const getSkyScoreHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const scores = await SkyScore.findAll({
      order: [['date', 'DESC']],
      limit: Math.min(days, 365)
    });

    res.status(200).json({
      status: 'success',
      count: scores.length,
      data: { scores }
    });
  } catch (error) {
    next(error);
  }
};
