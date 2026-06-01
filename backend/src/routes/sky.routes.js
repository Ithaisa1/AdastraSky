import express from 'express';
import { getAllZones, getZoneById, getZonesByIsland, getZonesByCategory, queryZones, recommendTonight, recommendForPhotography, getZonesGeoJSON, getAllZonesCSV } from '../controllers/sky.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/zones', getAllZones);
router.get('/zones/geojson', getZonesGeoJSON);
router.get('/zones/csv', getAllZonesCSV);
router.get('/zones/query', queryZones);
router.get('/zones/recommend/tonight', recommendTonight);
router.get('/zones/recommend/photo', recommendForPhotography);
router.get('/zones/:id', getZoneById);
router.get('/islands/:island', getZonesByIsland);
router.get('/category/:category', getZonesByCategory);

export default router;
