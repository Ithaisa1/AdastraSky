import express from 'express';
import rateLimit from 'express-rate-limit';
import { planObservation } from '../controllers/planner.controller.js';

const router = express.Router();

// Cada plan consulta la previsión de varias zonas: se limita por IP.
const plannerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

/**
 * @openapi
 * /api/planner:
 *   post:
 *     tags: [Planner]
 *     summary: Recomienda lugares y horarios para observar un objeto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [target]
 *             properties:
 *               target: { type: string, example: Saturno }
 *               when: { type: string, enum: [tonight, tomorrow, weekend, week] }
 *               start_date: { type: string, format: date }
 *               days: { type: integer, minimum: 1, maximum: 7 }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               island: { type: string }
 *               language: { type: string, enum: [es, en, de] }
 *     responses:
 *       200: { description: Recomendaciones con razones, limitaciones y fuentes }
 *       503: { description: AI Service no disponible }
 */
router.post('/', plannerLimiter, planObservation);

export default router;
