/**
 * AdastraSky Backend - Configuración de Base de Datos
 * PostgreSQL + Sequelize ORM
 *
 * Funciona con cualquier PostgreSQL >= 13: Neon, Supabase, Render o Docker local.
 *   DATABASE_URL   Cadena de conexión completa (prioritaria).
 *   DB_SSL         "true" | "false". Por defecto true si hay DATABASE_URL
 *                  (proveedores en la nube) y false para DB_HOST local.
 *   DB_SSL_REJECT_UNAUTHORIZED  "true" para validar el certificado del servidor.
 *   DB_POOL_MAX / DB_POOL_MIN   Tamaño del pool. Min 0 por defecto para que los
 *                  proveedores serverless (Neon) puedan suspender la BD inactiva.
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL,
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'adastrasky',
  DB_USER = 'postgres',
  DB_PASSWORD = '',
  NODE_ENV = 'development'
} = process.env;

const useSsl = (process.env.DB_SSL ?? (DATABASE_URL ? 'true' : 'false')) === 'true';

const baseOptions = {
  dialect: 'postgres',
  logging: NODE_ENV === 'development' && process.env.DB_LOGGING !== 'false' ? console.log : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' } }
    : {}
};

// Elimina sslmode/channel_binding de la URL: SSL se controla con DB_SSL
const sanitizeUrl = (url) => {
  if (!url) return url;
  return url
    .replace(/([?&])(sslmode|channel_binding)=[^&]*/g, '$1')
    .replace(/[?&]+$/, '')
    .replace(/\?&+/, '?')
    .replace(/&&+/g, '&');
};

const sequelize = DATABASE_URL
  ? new Sequelize(sanitizeUrl(DATABASE_URL), baseOptions)
  : new Sequelize(DB_NAME, DB_USER, String(DB_PASSWORD), {
      ...baseOptions,
      host: DB_HOST,
      port: DB_PORT
    });

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    return false;
  }
};

export { sanitizeUrl };
export default sequelize;
