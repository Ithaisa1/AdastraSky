import express from 'express';
import { getAllZones, getZoneById, getZonesByIsland, getZonesByCategory, queryZones, recommendTonight, recommendForPhotography, getZonesGeoJSON, getAllZonesCSV } from '../controllers/sky.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/sky/zones:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Lista todas las zonas astronómicas activas
 *     responses:
 *       200: { description: Lista de zonas }
 */
router.get('/zones', getAllZones);

/**
 * @openapi
 * /api/sky/zones/geojson:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Exporta zonas como GeoJSON
 *     responses:
 *       200: { description: FeatureCollection GeoJSON }
 */
router.get('/zones/geojson', getZonesGeoJSON);

/**
 * @openapi
 * /api/sky/zones/csv:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Exporta zonas como CSV
 *     responses:
 *       200: { description: Archivo CSV }
 */
router.get('/zones/csv', getAllZonesCSV);

/**
 * @openapi
 * /api/sky/zones/query:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Búsqueda avanzada con filtros
 *     parameters:
 *       - in: query
 *         name: island
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: maxBortle
 *         schema: { type: integer }
 *       - in: query
 *         name: minAltitude
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Zonas filtradas }
 */
router.get('/zones/query', queryZones);

/**
 * @openapi
 * /api/sky/zones/recommend/tonight:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Mejores zonas para observar esta noche
 *     parameters:
 *       - in: query
 *         name: island
 *         schema: { type: string }
 *     responses:
 *       200: { description: Top 5 recomendaciones }
 */
router.get('/zones/recommend/tonight', recommendTonight);

/**
 * @openapi
 * /api/sky/zones/recommend/photo:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Mejores zonas para astrofotografía
 *     parameters:
 *       - in: query
 *         name: island
 *         schema: { type: string }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *     responses:
 *       200: { description: Top 5 recomendaciones foto }
 */
router.get('/zones/recommend/photo', recommendForPhotography);

/**
 * @openapi
 * /api/sky/zones/{id}:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Detalle de una zona por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Zona detallada }
 *       404: { description: No encontrada }
 */
router.get('/zones/:id', getZoneById);

/**
 * @openapi
 * /api/sky/zones/islands/{island}:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Zonas por isla
 *     parameters:
 *       - in: path
 *         name: island
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Zonas de la isla }
 */
router.get('/islands/:island', getZonesByIsland);

/**
 * @openapi
 * /api/sky/zones/category/{category}:
 *   get:
 *     tags: [Sky Zones]
 *     summary: Zonas por categoría
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Zonas de la categoría }
 */
router.get('/category/:category', getZonesByCategory);

export default router;
