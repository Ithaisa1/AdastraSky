import { sanitizeUrl } from '../src/config/database.js';

describe('Configuración de PostgreSQL', () => {
  it.each([
    ['postgresql://u:p@h:5432/db?sslmode=require', 'postgresql://u:p@h:5432/db'],
    ['postgresql://u:p@ep-x.neon.tech/db?sslmode=require&channel_binding=require', 'postgresql://u:p@ep-x.neon.tech/db'],
    ['postgresql://u:p@h/db?application_name=adastra&sslmode=require', 'postgresql://u:p@h/db?application_name=adastra'],
    ['postgresql://u:p@h/db', 'postgresql://u:p@h/db'],
  ])('limpia parámetros SSL de %s', (input, expected) => {
    expect(sanitizeUrl(input)).toBe(expected);
  });
});
