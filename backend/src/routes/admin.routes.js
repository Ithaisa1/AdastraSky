import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  adminGetAllZones, adminCreateZone, adminUpdateZone, adminDeleteZone, adminHardDeleteZone,
  adminSeedZones, adminClearZones,
  adminGetAllUsers, adminGetUserById, adminUpdateUser, adminDeleteUser, adminHardDeleteUser
} from '../controllers/admin.controller.js';

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { status: 'error', code: 429, message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// All admin routes require authentication + admin role + rate limiting
router.use(authenticateToken, requireAdmin, adminLimiter);

// ============================================================
// ZONES MANAGEMENT
// ============================================================

router.get('/zones', adminGetAllZones);
router.post('/zones', adminCreateZone);
router.put('/zones/:id', adminUpdateZone);
router.delete('/zones/:id', adminDeleteZone);
router.delete('/zones/:id/hard', adminHardDeleteZone);
router.post('/zones/seed', adminSeedZones);
router.delete('/zones/clear', adminClearZones);

// ============================================================
// USERS MANAGEMENT
// ============================================================

router.get('/users', adminGetAllUsers);
router.get('/users/:id', adminGetUserById);
router.put('/users/:id', adminUpdateUser);
router.delete('/users/:id', adminDeleteUser);
router.delete('/users/:id/hard', adminHardDeleteUser);

export default router;
