/**
 * AdastraSky Backend - Rutas de Zonas de Cielo
 * Consulta de santuarios estelares y calidad del cielo
 */

import express from 'express';
import { getAllZones, getZoneById, getZonesByIsland, getZonesByCategory } from '../controllers/sky.controller.js';

const router = express.Router();

/**
 * @route   GET /api/sky/zones
 * @desc    Obtener todas las zonas de calidad del cielo
 * @access  Public
 */
router.get('/zones', getAllZones);

/**
 * @route   GET /api/sky/zones/:id
 * @desc    Obtener una zona específica por ID
 * @access  Public
 */
router.get('/zones/:id', getZoneById);

/**
 * @route   GET /api/sky/islands/:island
 * @desc    Obtener zonas por isla específica
 * @access  Public
 */
router.get('/islands/:island', getZonesByIsland);

/**
 * @route   GET /api/sky/category/:category
 * @desc    Obtener zonas por categoría
 * @access  Public
 */
router.get('/category/:category', getZonesByCategory);

export default router;
