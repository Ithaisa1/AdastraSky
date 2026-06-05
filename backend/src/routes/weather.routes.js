import express from 'express';
import axios from 'axios';

const router = express.Router();

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';

router.get('/current', async (req, res, next) => {
  try {
    const { lat, lon, lang = 'es' } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ status: 'error', code: 'MISSING_COORDS', message: 'lat y lon son requeridos' });
    }
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ status: 'error', code: 'NO_API_KEY', message: 'API key no configurada' });
    }
    const response = await axios.get(WEATHER_BASE, {
      params: { lat, lon, appid: WEATHER_API_KEY, units: 'metric', lang },
      timeout: 5000,
    });
    const data = response.data;
    res.json({
      status: 'success',
      data: {
        temperature: Math.round(data.main.temp),
        cloudiness: data.clouds.all,
        windSpeed: Math.round(data.wind.speed * 3.6),
        windDirection: data.wind.deg,
        visibility: Math.round(data.visibility / 1000),
        humidity: data.main.humidity,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
