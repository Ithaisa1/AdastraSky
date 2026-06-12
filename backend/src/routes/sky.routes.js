import express from 'express';
import { authenticateTokenOrApiKey } from '../middleware/apiKeyAuth.js';
import { getAllZones, getZoneById, getZonesByIsland, getZonesByCategory, queryZones, recommendTonight, recommendForPhotography, getZonesGeoJSON, getAllZonesCSV, getAllZonesPDF } from '../controllers/sky.controller.js';
import { saveSkyScore, getLatestSkyScore, getSkyScoreHistory } from '../controllers/skyScore.controller.js';

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
router.get('/zones/pdf', getAllZonesPDF);

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
router.get('/zones/islands/:island', getZonesByIsland);

router.get('/zones/category/:category', getZonesByCategory);

/**
 * @openapi
 * /api/sky/score:
 *   post:
 *     tags: [Sky Score]
 *     summary: Guarda un Sky Score diario (desde n8n)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, overall_score]
 *             properties:
 *               date: { type: string, format: date }
 *               overall_score: { type: number }
 *               astro_score: { type: number }
 *               photo_score: { type: number }
 *               tourism_score: { type: number }
 *     responses:
 *       201: { description: Score creado }
 *       200: { description: Score actualizado }
 */
router.post('/score', authenticateTokenOrApiKey, saveSkyScore);

/**
 * @openapi
 * /api/sky/score/latest:
 *   get:
 *     tags: [Sky Score]
 *     summary: Obtiene el último Sky Score registrado
 *     responses:
 *       200: { description: Último score }
 */
router.get('/score/latest', getLatestSkyScore);

/**
 * @openapi
 * /api/sky/score/history:
 *   get:
 *     tags: [Sky Score]
 *     summary: Historial de Sky Scores
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer }
 *         description: Número de días a retroceder (default 30)
 *     responses:
 *       200: { description: Lista de scores }
 */
router.get('/score/history', getSkyScoreHistory);

export default router;
