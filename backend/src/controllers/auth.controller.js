/**
 * AdastraSky Backend - Controlador de Autenticación
 * Registro, login y gestión de perfiles de usuario
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import { purgeUser } from '../services/userPurge.js';
import { isDemoAccount, DEMO_LOCKED_RESPONSE } from '../utils/demoAccount.js';

const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'must contain uppercase, lowercase and number').required(),
  first_name: Joi.string().trim().max(100).required(),
  last_name: Joi.string().trim().max(100).required(),
  preferred_language: Joi.string().valid('es', 'en', 'de').default('es'),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

/**
 * Registrar un nuevo usuario
 */
export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Error de validación de datos',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }

    const { email, password, first_name, last_name, preferred_language } = value;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        code: 'USER_EXISTS',
        message: 'El email ya está registrado'
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      preferred_language
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado correctamente',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          preferred_language: user.preferred_language,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Iniciar sesión
 */
export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Error de validación de datos',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }

    const { email, password } = value;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        code: 'USER_INACTIVE',
        message: 'Usuario inactivo'
      });
    }

    // Actualizar último login
    await user.update({ last_login: new Date() });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          preferred_language: user.preferred_language,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().max(100),
  last_name: Joi.string().trim().max(100),
  email: Joi.string().email({ tlds: { allow: false } }),
  bio: Joi.string().trim().max(500).allow(''),
  location: Joi.string().trim().max(255).allow(''),
  preferred_language: Joi.string().valid('es', 'en', 'de'),
});

export const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }
    const { first_name, last_name, email, bio, location, preferred_language } = value;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    // La cuenta demo es pública: se puede editar el perfil, pero no el email
    if (email && email !== user.email && isDemoAccount(user.email)) {
      return res.status(403).json(DEMO_LOCKED_RESPONSE);
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          status: 'error',
          code: 'EMAIL_EXISTS',
          message: 'El email ya está en uso'
        });
      }
    }

    await user.update({
      first_name: first_name ?? user.first_name,
      last_name: last_name ?? user.last_name,
      email: email ?? user.email,
      bio: bio ?? user.bio,
      location: location ?? user.location,
      preferred_language: preferred_language ?? user.preferred_language,
    });

    const { password, ...userData } = user.toJSON();

    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado correctamente',
      data: { user: userData }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Elimina la cuenta del usuario autenticado y TODOS sus datos:
 * conversaciones con la IA, experiencias e imágenes. Exige la contraseña.
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ status: 'error', code: 'PASSWORD_REQUIRED', message: 'Confirma con tu contraseña' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });
    }
    if (isDemoAccount(user.email)) {
      return res.status(403).json(DEMO_LOCKED_RESPONSE);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ status: 'error', code: 'INVALID_PASSWORD', message: 'Contraseña incorrecta' });
    }

    await purgeUser(user.id);

    res.status(200).json({ status: 'success', message: 'Cuenta eliminada' });
  } catch (error) {
    next(error);
  }
};
