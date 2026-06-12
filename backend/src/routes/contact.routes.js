import express from 'express';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(10).max(2000).required(),
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    code: 429,
    message: 'Demasiados mensajes de contacto. Intenta de nuevo en 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: error.details.map(d => d.message).join('. ')
      });
    }
    await ContactMessage.create(value);
    res.status(200).json({ status: 'success', message: 'Mensaje recibido correctamente' });
  } catch (err) {
    next(err);
  }
});

export default router;
