import SkyQualityZone from '../models/SkyQualityZone.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { calcGlobalScore } from '../utils/skyScoring.js';
import bcrypt from 'bcryptjs';

const withScores = (zone) => {
  const plain = zone.dataValues || zone;
  const scores = calcGlobalScore(plain);
  return { ...plain, astro_score: scores.astro, photo_score: scores.photo, tourism_score: scores.tourism, global_score: scores.global, scores };
};

// ============================================================
// ZONES CRUD
// ============================================================

const SORTABLE_FIELDS = ['name', 'island', 'category', 'bortle_scale', 'altitude', 'municipality'];

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
    const zone = await SkyQualityZone.create(req.body);
    res.status(201).json({ status: 'success', data: { zone: withScores(zone) } });
  } catch (error) { next(error); }
};

export const adminUpdateZone = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: 'error', code: 'ZONE_NOT_FOUND', message: 'Zona no encontrada' });
    await zone.update(req.body);
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

    const { password, ...updates } = req.body;
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
