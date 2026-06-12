/**
 * AdastraSky Backend - Middleware de Ruta No Encontrada
 * Maneja las solicitudes a rutas que no existen
 */

export const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: 'Ruta no encontrada',
    timestamp: new Date().toISOString()
  });
};

export default notFound;
