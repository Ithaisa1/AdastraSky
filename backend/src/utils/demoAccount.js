/**
 * Cuenta de demostración pública.
 * Sus credenciales aparecen en el README para que cualquiera pueda probar la app,
 * así que nadie debe poder cambiarle el email ni borrarla.
 */

export const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'invitada@adastra.sky').toLowerCase();

export const isDemoAccount = (email) =>
  typeof email === 'string' && email.trim().toLowerCase() === DEMO_EMAIL;

export const DEMO_LOCKED_RESPONSE = {
  status: 'error',
  code: 'DEMO_ACCOUNT_LOCKED',
  message: 'La cuenta de demostración no se puede borrar ni cambiar de email',
};
