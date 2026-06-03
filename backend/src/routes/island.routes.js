/**
 * AdastraSky Backend - Rutas de Islas
 * Información general de las islas del archipiélago
 */

import express from 'express';
import { getAllIslands, getIslandByName } from '../controllers/island.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/islands:
 *   get:
 *     tags: [Islands]
 *     summary: Lista de todas las islas con datos astronómicos
 *     responses:
 *       200: { description: Lista de islas }
 */
router.get('/', getAllIslands);

/**
 * @openapi
 * /api/islands/{name}:
 *   get:
 *     tags: [Islands]
 *     summary: Detalle de una isla por nombre
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Datos de la isla }
 *       404: { description: Isla no encontrada }
 */
router.get('/:name', getIslandByName);

export default router;
