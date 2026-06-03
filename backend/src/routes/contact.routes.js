import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ status: 'error', code: 'MISSING_FIELDS', message: 'Todos los campos son obligatorios' });
    }
    console.log(`[CONTACT] ${name} <${email}> - ${subject}: ${message.substring(0, 100)}...`);
    res.status(200).json({ status: 'success', message: 'Mensaje recibido correctamente' });
  } catch (err) {
    next(err);
  }
});

export default router;
