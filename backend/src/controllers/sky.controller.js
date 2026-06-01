import SkyQualityZone from '../models/SkyQualityZone.js';
import { Op } from 'sequelize';
import { calcGlobalScore, findBestZone } from '../utils/skyScoring.js';

const withScores = (zone) => {
  const plain = zone.dataValues || zone;
  const scores = calcGlobalScore(plain);
  return { ...plain, astro_score: scores.astro, photo_score: scores.photo, tourism_score: scores.tourism, global_score: scores.global, scores };
};

export const getAllZones = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({
      where: { is_active: true },
      order: [['island', 'ASC'], ['name', 'ASC']]
    });
    const data = zones.map(withScores);
    res.status(200).json({ status: 'success', count: data.length, data: { zones: data } });
  } catch (error) { next(error); }
};

export const getZoneById = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: 'error', code: 'ZONE_NOT_FOUND', message: 'Zona no encontrada' });
    res.status(200).json({ status: 'success', data: { zone: withScores(zone) } });
  } catch (error) { next(error); }
};

export const getZonesByIsland = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { island: req.params.island, is_active: true }, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.status(200).json({ status: 'success', count: zones.length, data: { zones: zones.map(withScores) } });
  } catch (error) { next(error); }
};

export const getZonesByCategory = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { category: req.params.category, is_active: true }, order: [['island', 'ASC'], ['name', 'ASC']] });
    res.status(200).json({ status: 'success', count: zones.length, data: { zones: zones.map(withScores) } });
  } catch (error) { next(error); }
};

export const queryZones = async (req, res, next) => {
  try {
    const { island, category, subcategory, maxBortle, minAltitude, accessType, priority, minScore, limit = 20 } = req.query;
    const where = { is_active: true };
    if (island) where.island = island;
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (maxBortle) where.bortle_scale = { [Op.lte]: parseInt(maxBortle) };
    if (minAltitude) where.altitude = { [Op.gte]: parseInt(minAltitude) };
    if (accessType) where.access_type = accessType;

    let zones = await SkyQualityZone.findAll({ where, order: [['name', 'ASC']] });
    let scored = zones.map(z => ({ ...z.dataValues, scores: calcGlobalScore(z) }));

    if (priority === 'photo') scored.sort((a, b) => b.scores.photo - a.scores.photo);
    else if (priority === 'tourism') scored.sort((a, b) => b.scores.tourism - a.scores.tourism);
    else scored.sort((a, b) => b.scores.global - a.scores.global);

    if (minScore) scored = scored.filter(z => z.scores.global >= parseInt(minScore));
    scored = scored.slice(0, parseInt(limit));

    res.status(200).json({ status: 'success', count: scored.length, query: req.query, data: { zones: scored } });
  } catch (error) { next(error); }
};

export const recommendTonight = async (req, res, next) => {
  try {
    const { island } = req.query;
    const where = { is_active: true };
    if (island) where.island = island;
    const zones = await SkyQualityZone.findAll({ where });
    const best = findBestZone(zones, { priority: 'astro', ...(island && { island }), maxBortle: 3 });
    res.status(200).json({
      status: 'success',
      recommendation: best.slice(0, 5),
      meta: { total: best.length, island: island || 'todas', priority: 'astro', timestamp: new Date().toISOString() }
    });
  } catch (error) { next(error); }
};

export const recommendForPhotography = async (req, res, next) => {
  try {
    const { island, subject } = req.query;
    const where = { is_active: true };
    if (island) where.island = island;
    let zones = await SkyQualityZone.findAll({ where });
    let scored = zones.map(z => ({ ...z.dataValues, scores: calcGlobalScore(z) }));
    if (subject === 'milky_way') scored.sort((a, b) => (b.milky_way_quality || 0) - (a.milky_way_quality || 0));
    else scored.sort((a, b) => b.scores.photo - a.scores.photo);
    res.status(200).json({
      status: 'success',
      recommendation: scored.slice(0, 5),
      meta: { total: scored.length, island: island || 'todas', subject: subject || 'general', timestamp: new Date().toISOString() }
    });
  } catch (error) { next(error); }
};

export const getZonesGeoJSON = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { is_active: true } });
    const features = zones.map(z => ({
      type: 'Feature',
      properties: { id: z.id, name: z.name, island: z.island, category: z.category, bortle: z.bortle_scale, altitude: z.altitude, access: z.access_type, has_parking: z.has_parking },
      geometry: { type: 'Point', coordinates: [parseFloat(z.longitude), parseFloat(z.latitude)] }
    }));
    res.status(200).json({ type: 'FeatureCollection', features });
  } catch (error) { next(error); }
};

export const getAllZonesCSV = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { is_active: true } });
    const header = 'id,name,island,municipality,category,subcategory,latitude,longitude,altitude,bortle_scale,access_type,has_parking,has_bathrooms,has_cafe,has_mobile_coverage,safety_risk,astro_score,photo_score,tourism_score,global_score';
    const rows = zones.map(z => `"${z.id}","${z.name}","${z.island}","${z.municipality || ''}","${z.category}","${z.subcategory || ''}",${z.latitude},${z.longitude},${z.altitude},${z.bortle_scale},"${z.access_type || ''}",${z.has_parking},${z.has_bathrooms},${z.has_cafe},${z.has_mobile_coverage},${z.safety_risk},${z.astro_score || ''},${z.photo_score || ''},${z.tourism_score || ''},${z.global_score || ''}`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=adastra_zones.csv');
    res.status(200).send([header, ...rows].join('\n'));
  } catch (error) { next(error); }
};
