/**
 * Utilidades para tests de integración con PostgreSQL.
 * Si no hay BD de tests disponible, los bloques `describeDb` se omiten (no fallan).
 */
import { describe } from '@jest/globals';
import jwt from 'jsonwebtoken';
import sequelize from '../../src/config/database.js';
import '../../src/models/index.js';

export const dbAvailable = await sequelize.authenticate().then(() => true).catch(() => false);

export const describeDb = dbAvailable ? describe : describe.skip;

export const tokenFor = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

export async function createUser(User, suffix = Math.random().toString(36).slice(2)) {
  return User.create({
    email: `u_${suffix}@adastra.test`,
    password: 'hash-no-usado',
    first_name: 'Test',
    last_name: suffix,
    role: 'user',
    preferred_language: 'es'
  });
}
