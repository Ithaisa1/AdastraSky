/**
 * AdastraSky Backend - Rutas de Islas
 * Información general de las islas del archipiélago
 */

import express from 'express';
import { getAllIslands, getIslandByName } from '../controllers/island.controller.js';

const router = express.Router();

/**
 * @route   GET /api/islands
 * @desc    Obtener información de todas las islas
 * @access  Public
 */
router.get('/', getAllIslands);

/**
 * @route   GET /api/islands/:name
 * @desc    Obtener información de una isla específica
 * @access  Public
 */
router.get('/:name', getIslandByName);

export default router;
