import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Experience from '../models/Experience.js';
import User from '../models/User.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpe?g|png|tiff?|raw|cr2|nef|arw|dng/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = file.mimetype.startsWith('image/');
    cb(null, extOk && mimeOk);
  }
});

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { zone_id, limit = 20, offset = 0 } = req.query;
    const where = {};
    if (zone_id) where.zone_id = zone_id;

    const experiences = await Experience.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'first_name', 'last_name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        experiences: experiences.rows,
        total: experiences.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener experiencias'
    });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const experiences = await Experience.findAll({
      where: { user_id: req.params.userId },
      order: [['created_at', 'DESC']]
    });

    res.json({ status: 'success', data: experiences });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener experiencias del usuario'
    });
  }
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { status: 'error', code: 429, message: 'Demasiadas experiencias. Máximo 10 por hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', authenticateToken, createLimiter, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, zone_id } = req.body;
    if (!title || !zone_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Título y ubicación son obligatorios'
      });
    }

    const images = [];
    if (req.files) {
      for (const file of req.files) {
        const baseName = path.parse(file.filename).name;
        const webpFilename = `${baseName}.webp`;
        const webpPath = path.join(file.destination, webpFilename);

        try {
          await sharp(file.path).webp({ quality: 85 }).toFile(webpPath);
          await fs.unlink(file.path);
          images.push(`/uploads/${webpFilename}`);
        } catch {
          images.push(`/uploads/${file.filename}`);
        }
      }
    }

    const experience = await Experience.create({
      user_id: req.user.id,
      zone_id,
      title,
      description: description || '',
      images
    });

    const fullExperience = await Experience.findByPk(experience.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'first_name', 'last_name']
      }]
    });

    res.status(201).json({
      status: 'success',
      data: fullExperience
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al crear experiencia'
    });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const experience = await Experience.findByPk(req.params.id);
    if (!experience) {
      return res.status(404).json({
        status: 'error',
        message: 'Experiencia no encontrada'
      });
    }

    if (experience.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para eliminar esta experiencia'
      });
    }

    await experience.destroy();

    res.json({
      status: 'success',
      message: 'Experiencia eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar experiencia'
    });
  }
});

export default router;
