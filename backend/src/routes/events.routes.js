import express from 'express';
import { getAllEvents, seedEvents, getNasaApod } from '../controllers/events.controller.js';

const router = express.Router();

router.get('/', getAllEvents);
router.post('/seed', seedEvents);
router.get('/nasa/apod', getNasaApod);

export default router;
