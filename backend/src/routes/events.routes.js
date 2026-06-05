import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getAllEvents, seedEvents, getNasaApod } from '../controllers/events.controller.js';

const router = express.Router();

router.get('/', getAllEvents);
router.post('/seed', authenticateToken, requireAdmin, seedEvents);
router.get('/nasa/apod', getNasaApod);

export default router;
