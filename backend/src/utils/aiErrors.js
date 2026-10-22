/**
 * Traducción de errores del ai-service a respuestas HTTP del backend.
 */

/** Traduce errores de axios a respuestas HTTP coherentes. Devuelve true si respondió. */
export function sendAiError(error, res) {
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    res.status(503).json({ status: 'error', code: 'AI_SERVICE_UNAVAILABLE', message: 'El servicio de IA no está disponible' });
    return true;
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    res.status(504).json({ status: 'error', code: 'AI_SERVICE_TIMEOUT', message: 'Timeout del servicio de IA' });
    return true;
  }
  if (error.response) {
    const status = error.response.status === 401 ? 502 : error.response.status === 422 ? 400 : 502;
    const detail = typeof error.response.data?.detail === 'string' ? error.response.data.detail : error.response.statusText;
    res.status(status).json({ status: 'error', code: status === 400 ? 'INVALID_REQUEST' : 'AI_SERVICE_ERROR', message: `Error del servicio de IA: ${detail}` });
    return true;
  }
  return false;
}
