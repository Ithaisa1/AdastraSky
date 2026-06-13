import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags: [Chat]
 *     summary: Enviar mensaje al agente de IA
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               language: { type: string, default: es }
 *               session_id: { type: string, format: uuid }
 *     responses:
 *       200: { description: Respuesta del agente IA }
 *       503: { description: AI Service no disponible }
 *       504: { description: Timeout del AI Service }
 */
router.post('/', authenticateToken, sendMessage);
router.get('/warmup', async (req, res) => {
  try {
    const axios = (await import('axios')).default;
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    await axios.get(`${aiUrl}/health`, { timeout: 25000 });
    res.json({ status: 'success', message: 'AI service warm' });
  } catch {
    res.json({ status: 'success', message: 'AI service warming up' });
  }
});

/**
 * @openapi
 * /api/chat/history/{session_id}:
 *   get:
 *     tags: [Chat]
 *     summary: Obtener historial de chat del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: Historial de conversaciones }
 */
router.get('/history/:session_id', authenticateToken, getChatHistory);

export default router;
