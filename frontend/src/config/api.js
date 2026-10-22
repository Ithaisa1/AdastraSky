/**
 * URL base del backend. Se configura con VITE_API_URL (ver .env.example).
 * Único punto de verdad: si cambias de servidor, cambia solo esta variable.
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'https://aadastra-sky-backend.onrender.com').replace(/\/+$/, '');

/** Convierte rutas relativas del backend (p. ej. /media/<id>) en URLs absolutas. */
export const assetUrl = (path) => (!path ? '' : /^https?:\/\//.test(path) ? path : `${API_URL}${path}`);
