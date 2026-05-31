/**
 * AdastraSky Backend - Middleware de Autenticación
 * Verifica tokens JWT para proteger rutas
 */

import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'error',
      code: 'NO_TOKEN_PROVIDED',
      message: 'Token de autenticación no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Token de autenticación expirado'
      });
    }

    return res.status(403).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Token de autenticación inválido'
    });
  }
};

export default authenticateToken;
