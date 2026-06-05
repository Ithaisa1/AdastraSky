import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

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
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ status: 'error', code: 'MISSING_FIELDS', message: 'Todos los campos son obligatorios' });
    }
    console.log(`[CONTACT] Mensaje recibido de ${email.substring(0, 3)}***`);
    res.status(200).json({ status: 'success', message: 'Mensaje recibido correctamente' });
  } catch (err) {
    next(err);
  }
});

export default router;
