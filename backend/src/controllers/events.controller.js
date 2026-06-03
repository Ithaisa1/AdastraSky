import Event from '../models/Event.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export async function getAllEvents(req, res) {
  try {
    const { month, year, type } = req.query;
    const where = {};

    if (month && year) {
      const m = String(month).padStart(2, '0');
      where.date = {
        [Op.between]: [`${year}-${m}-01`, `${year}-${m}-31`]
      };
    } else if (year) {
      where.date = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`]
      };
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const events = await Event.findAll({
      where,
      order: [['date', 'ASC']]
    });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function seedEvents(req, res) {
  try {
    const count = await Event.count();
    if (count > 0) {
      return res.json({ success: true, message: 'Eventos ya existen', count });
    }

    const events = [
      { name: 'Lluvia de Estrellas Perseidas', type: 'meteor_shower', date: '2026-08-12', peak: '12-13 Ago', description: 'Hasta 100 meteoros/hora. Cometa Swift-Tuttle.', hemisphere: 'Norte', moon_phase: 'Menguante', icon: 'meteors' },
      { name: 'Eclipse Lunar Total', type: 'eclipse', date: '2026-09-18', peak: '18 Sep', description: 'Luna rojiza. Visible desde Europa, África, América.', hemisphere: 'Global', moon_phase: 'Llena', icon: 'eclipse' },
      { name: 'Lluvia de Estrellas Gemínidas', type: 'meteor_shower', date: '2026-12-14', peak: '13-14 Dic', description: 'Hasta 150 meteoros/hora. Asteroide 3200 Phaethon.', hemisphere: 'Norte', moon_phase: 'Nueva', icon: 'meteors' },
      { name: 'Cometa C/2026 A3', type: 'comet', date: '2026-10-15', peak: '15-20 Oct', description: 'Posible magnitud 4. Visible a simple vista.', hemisphere: 'Norte', moon_phase: 'Creciente', icon: 'comet' },
      { name: 'Oposición de Júpiter', type: 'planetary', date: '2026-12-07', peak: '7 Dic', description: 'Júpiter en su punto más brillante y cercano.', hemisphere: 'Global', moon_phase: 'Menguante', icon: 'planets' },
      { name: 'Lluvia de Estrellas Cuádridas', type: 'meteor_shower', date: '2027-01-03', peak: '3-4 Ene', description: 'Hasta 40 meteoros/hora. Meteoros brillantes.', hemisphere: 'Norte', moon_phase: 'Nueva', icon: 'meteors' },
      { name: 'Eclipse Solar Parcial', type: 'eclipse', date: '2026-10-02', peak: '2 Oct', description: 'Visible desde el sur de Europa y norte de África.', hemisphere: 'Global', moon_phase: 'Nueva', icon: 'eclipse' },
      { name: 'Oposición de Saturno', type: 'planetary', date: '2026-08-15', peak: '15 Ago', description: 'Saturno en oposición. Mejor momento para ver anillos.', hemisphere: 'Global', moon_phase: 'Creciente', icon: 'planets' },
      { name: 'Conjunción Venus-Júpiter', type: 'conjunction', date: '2026-05-22', peak: '22 May', description: 'Venus y Júpiter separados por 0.5°. Espectacular.', hemisphere: 'Global', moon_phase: 'Creciente', icon: 'conjunction' },
      { name: 'Lluvia de Estrellas Leónidas', type: 'meteor_shower', date: '2026-11-17', peak: '17-18 Nov', description: 'Hasta 20 meteoros/hora. Cometa Tempel-Tuttle.', hemisphere: 'Norte', moon_phase: 'Creciente', icon: 'meteors' },
      { name: 'Eclipse Lunar Parcial', type: 'eclipse', date: '2027-03-03', peak: '3 Mar', description: 'Parcial, visible desde Europa y África.', hemisphere: 'Global', moon_phase: 'Llena', icon: 'eclipse' },
      { name: 'Oposición de Marte', type: 'planetary', date: '2027-01-16', peak: '16 Ene', description: 'Marte en oposición. Excelente para observación.', hemisphere: 'Global', moon_phase: 'Creciente', icon: 'planets' },
      { name: 'Superluna de Verano', type: 'supermoon', date: '2026-07-21', peak: '21 Jul', description: 'Luna llena más grande y brillante del año.', hemisphere: 'Global', moon_phase: 'Llena', icon: 'moon' },
      { name: 'Lluvia de Estrellas Líridas', type: 'meteor_shower', date: '2026-04-22', peak: '22-23 Abr', description: 'Hasta 20 meteoros/hora. Meteoros brillantes y rápidos.', hemisphere: 'Norte', moon_phase: 'Creciente', icon: 'meteors' },
      { name: 'Conjunción Venus-Júpiter', type: 'conjunction', date: '2026-06-18', peak: '18 Jun', description: 'Brillante conjunción al amanecer.', hemisphere: 'Global', moon_phase: 'Creciente', icon: 'conjunction' },
    ];

    await Event.bulkCreate(events);
    const created = await Event.count();

    res.status(201).json({ success: true, message: `${created} eventos creados` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

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
