import User from '../models/User.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }
    req.user.role = user.role;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 'AUTH_CHECK_FAILED',
      message: 'Error al verificar permisos de administrador'
    });
  }
};

export default requireAdmin;
