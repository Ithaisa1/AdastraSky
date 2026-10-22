import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-2024';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_LOGGING = 'false';
process.env.AI_SERVICE_URL = 'http://ai.invalid';
delete process.env.AI_SERVICE_API_KEY;

// Los tests NUNCA usan la base de datos de producción.
// Para los tests de integración define TEST_DATABASE_URL (p. ej. el PostgreSQL de
// docker-compose: postgresql://postgres:localtest@localhost:55432/adastrasky_test).
delete process.env.DATABASE_URL;
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DB_SSL = process.env.TEST_DB_SSL || 'false';
}
