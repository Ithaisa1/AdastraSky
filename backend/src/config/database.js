/**
 * AdastraSky Backend - Configuración de Base de Datos
 * PostgreSQL + Sequelize ORM
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

const baseOptions = {
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

// 🔥 CONEXIÓN A POSTGRES (LOCAL + RENDER)
// Sanitizar DATABASE_URL: eliminar sslmode para evitar conflicto con dialectOptions
const sanitizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/(\?|&)sslmode=[^&]+/g, '').replace(/[?&]$/, '');
};

const sequelize = DATABASE_URL
  ? new Sequelize(sanitizeUrl(DATABASE_URL), {
      ...baseOptions,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      ...baseOptions,
      host: DB_HOST,
      port: DB_PORT
    });

// Test de conexión (opcional pero útil)
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

export default sequelize;