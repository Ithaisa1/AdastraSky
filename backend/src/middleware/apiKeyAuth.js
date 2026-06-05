import jwt from 'jsonwebtoken';

export const authenticateTokenOrApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && process.env.N8N_API_KEY && apiKey === process.env.N8N_API_KEY) {
    req.user = { role: 'admin', source: 'api_key' };
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', code: 'NO_TOKEN_PROVIDED', message: 'Token o API key requerido' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ status: 'error', code: 'INVALID_TOKEN', message: 'Token inválido' });
  }
};
