/**
 * AdastraSky Backend - Rutas de Chat
 * Proxy hacia el microservicio de IA
 */

import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Enviar mensaje al agente de IA
 * @access  Private
 */
router.post('/message', authenticateToken, sendMessage);

/**
 * @route   GET /api/chat/history
 * @desc    Obtener historial de chat del usuario
 * @access  Private
 */
router.get('/history', authenticateToken, getChatHistory);

export default router;
