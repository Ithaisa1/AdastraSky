/**
 * AdastraSky Backend - Middleware de Manejo de Errores
 * Captura y procesa todos los errores de la aplicación
 */

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error detectado:', err);

  // Errores de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Error de validación de datos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'DATABASE_VALIDATION_ERROR',
      message: 'Error de validación en base de datos',
      details: err.errors.map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      code: 'DUPLICATE_ENTRY',
      message: 'El registro ya existe',
      details: err.errors.map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status: 'error',
      code: 'FOREIGN_KEY_ERROR',
      message: 'Violación de clave foránea',
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Token de autenticación inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: 'Token de autenticación expirado'
    });
  }

  // Errores personalizados con código de estado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code || 'CUSTOM_ERROR',
      message: err.message || 'Error en la solicitud'
    });
  }

  // Error por defecto (500)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
