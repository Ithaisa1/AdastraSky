import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  adminGetAllZones, adminCreateZone, adminUpdateZone, adminDeleteZone, adminHardDeleteZone,
  adminGetAllUsers, adminGetUserById, adminUpdateUser, adminDeleteUser, adminHardDeleteUser
} from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// ============================================================
// ZONES MANAGEMENT
// ============================================================

router.get('/zones', adminGetAllZones);
router.post('/zones', adminCreateZone);
router.put('/zones/:id', adminUpdateZone);
router.delete('/zones/:id', adminDeleteZone);
router.delete('/zones/:id/hard', adminHardDeleteZone);

// ============================================================
// USERS MANAGEMENT
// ============================================================

router.get('/users', adminGetAllUsers);
router.get('/users/:id', adminGetUserById);
router.put('/users/:id', adminUpdateUser);
router.delete('/users/:id', adminDeleteUser);
router.delete('/users/:id/hard', adminHardDeleteUser);

export default router;
