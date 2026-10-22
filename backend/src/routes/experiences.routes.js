import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Experience from '../models/Experience.js';
import ExperienceImage from '../models/ExperienceImage.js';
import User from '../models/User.js';
import { saveImage, deleteImagesByUrls, mediaIdFromUrl } from '../utils/imageStore.js';

// Las imágenes se procesan en memoria y se guardan en PostgreSQL (ver utils/imageStore.js).
// Formatos RAW (cr2, nef, arw, dng) no se aceptan: no se pueden convertir a WebP en el servidor.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpe?g|png|tiff?|webp)$/;
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
    for (const file of req.files || []) {
      try {
        images.push(await saveImage(file.buffer));
      } catch {
        await deleteImagesByUrls(images);
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_IMAGE',
          message: `No se pudo procesar la imagen ${file.originalname}`
        });
      }
    }

    const experience = await Experience.create({
      user_id: req.user.id,
      zone_id,
      title,
      description: description || '',
      images
    });

    const imageIds = images.map(mediaIdFromUrl).filter(Boolean);
    if (imageIds.length) {
      await ExperienceImage.update({ experience_id: experience.id }, { where: { id: imageIds } });
    }

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

    await deleteImagesByUrls(experience.images || []);
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
