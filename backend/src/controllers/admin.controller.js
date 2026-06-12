import SkyQualityZone from '../models/SkyQualityZone.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { calcGlobalScore } from '../utils/skyScoring.js';
import bcrypt from 'bcryptjs';
import ZONES_SEED from '../seed/seedZones.js';

const withScores = (zone) => {
  const plain = zone.dataValues || zone;
  const scores = calcGlobalScore(plain);
  return { ...plain, astro_score: scores.astro, photo_score: scores.photo, tourism_score: scores.tourism, global_score: scores.global, scores };
};

// ============================================================
// ZONES CRUD
// ============================================================

const SORTABLE_FIELDS = ['name', 'island', 'category', 'bortle_scale', 'altitude', 'municipality'];

const ALLOWED_ZONE_FIELDS = [
  'name', 'island', 'municipality', 'category', 'subcategory',
  'bortle_scale', 'sqm_estimate', 'seeing_estimate', 'transparency',
  'avg_humidity', 'avg_cloudiness', 'clear_nights_per_year',
  'latitude', 'longitude', 'altitude', 'access_type', 'accessibility',
  'has_parking', 'has_bathrooms', 'has_cafe', 'has_mobile_coverage',
  'has_electricity', 'has_water', 'safety_risk', 'has_cliffs', 'has_high_wind',
  'night_access', 'permits_needed', 'landscape_quality', 'astro_orientation',
  'photo_composition', 'photographer_access', 'milky_way_quality',
  'milky_way_season', 'deep_sky_quality', 'star_trails_quality',
  'lunar_quality', 'solar_quality', 'eclipse_quality',
  'description', 'image_url', 'streaming_url', 'is_active',
];

const ALLOWED_USER_UPDATE_FIELDS = [
  'first_name', 'last_name', 'email', 'bio', 'location',
  'is_active', 'preferred_language',
];

const pick = (obj, keys) => keys.reduce((acc, key) => {
  if (key in obj) acc[key] = obj[key];
  return acc;
}, {});

export const adminGetAllZones = async (req, res, next) => {
  try {
    const sortBy = SORTABLE_FIELDS.includes(req.query.sortBy) ? req.query.sortBy : 'island';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';
    const order = [[sortBy, sortOrder], ['name', 'ASC']];
    const zones = await SkyQualityZone.findAll({ order });
    const data = zones.map(withScores);
    res.status(200).json({ status: 'success', count: data.length, data: { zones: data } });
  } catch (error) { next(error); }
};

export const adminCreateZone = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.create(pick(req.body, ALLOWED_ZONE_FIELDS));
    res.status(201).json({ status: 'success', data: { zone: withScores(zone) } });
  } catch (error) { next(error); }
};

export const adminUpdateZone = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: 'error', code: 'ZONE_NOT_FOUND', message: 'Zona no encontrada' });
    await zone.update(pick(req.body, ALLOWED_ZONE_FIELDS));
    res.status(200).json({ status: 'success', data: { zone: withScores(zone) } });
  } catch (error) { next(error); }
};

export const adminDeleteZone = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: 'error', code: 'ZONE_NOT_FOUND', message: 'Zona no encontrada' });
    await zone.update({ is_active: false });
    res.status(200).json({ status: 'success', message: 'Zona desactivada correctamente' });
  } catch (error) { next(error); }
};

export const adminHardDeleteZone = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: 'error', code: 'ZONE_NOT_FOUND', message: 'Zona no encontrada' });
    await zone.destroy();
    res.status(200).json({ status: 'success', message: 'Zona eliminada permanentemente' });
  } catch (error) { next(error); }
};

export const adminSeedZones = async (req, res, next) => {
  try {
    const existing = await SkyQualityZone.count();
    if (existing > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        status: 'error',
        code: 'ZONES_EXIST',
        message: `Ya existen ${existing} zonas. Usa ?force=true para reemplazarlas.`
      });
    }
    if (existing > 0) {
      await SkyQualityZone.destroy({ where: {} });
    }
    const created = await SkyQualityZone.bulkCreate(ZONES_SEED, { validate: false });
    res.status(201).json({
      status: 'success',
      message: `${created.length} zonas creadas correctamente`,
      count: created.length,
      data: { zones: created.map(withScores) }
    });
  } catch (error) {
    next(error);
  }
};

export const adminClearZones = async (req, res, next) => {
  try {
    const deleted = await SkyQualityZone.destroy({ where: {} });
    res.status(200).json({
      status: 'success',
      message: `${deleted} zonas eliminadas permanentemente`
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// USERS CRUD
// ============================================================

export const adminGetAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['last_login', 'DESC NULLS LAST']]
    });
    res.status(200).json({ status: 'success', count: users.length, data: { users } });
  } catch (error) { next(error); }
};

export const adminGetUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ status: 'error', code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
};

export const adminUpdateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });

    const { password, ...rawUpdates } = req.body;
    const updates = pick(rawUpdates, ALLOWED_USER_UPDATE_FIELDS);
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    if (updates.email) {
      const existing = await User.findOne({ where: { email: updates.email, id: { [Op.ne]: user.id } } });
      if (existing) return res.status(409).json({ status: 'error', code: 'EMAIL_EXISTS', message: 'El email ya está en uso' });
    }

    await user.update(updates);
    const updated = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.status(200).json({ status: 'success', data: { user: updated } });
  } catch (error) { next(error); }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });
    await user.update({ is_active: false });
    res.status(200).json({ status: 'success', message: 'Usuario desactivado correctamente' });
  } catch (error) { next(error); }
};

export const adminHardDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });
    await user.destroy();
    res.status(200).json({ status: 'success', message: 'Usuario eliminado permanentemente' });
  } catch (error) { next(error); }
};
