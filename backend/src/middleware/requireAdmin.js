export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      code: 'FORBIDDEN',
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};

export default requireAdmin;
