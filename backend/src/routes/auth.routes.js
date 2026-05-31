/**
 * AdastraSky Backend - Rutas de Autenticación
 * Registro, login y gestión de sesiones
 */

import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión y obtener token JWT
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticateToken, getProfile);

export default router;
