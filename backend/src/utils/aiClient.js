/**
 * Cliente HTTP del microservicio de IA.
 * Envía X-API-Key si AI_SERVICE_API_KEY está definida (debe coincidir con la del ai-service).
 */

import axios from 'axios';

export const AI_SERVICE_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8001';

export const aiHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.AI_SERVICE_API_KEY) headers['X-API-Key'] = process.env.AI_SERVICE_API_KEY;
  return headers;
};

export const aiPost = (path, body, timeout = 120000) =>
  axios.post(`${AI_SERVICE_URL()}${path}`, body, { timeout, headers: aiHeaders() });
