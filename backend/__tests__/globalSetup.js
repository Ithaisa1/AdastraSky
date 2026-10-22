// Crea las tablas UNA vez antes de los tests de integración (evita carreras entre ficheros).
export default async function globalSetup() {
  if (!process.env.TEST_DATABASE_URL) return;
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DB_SSL = process.env.TEST_DB_SSL || 'false';
  const { default: sequelize } = await import('../src/config/database.js');
  await import('../src/models/index.js');
  await sequelize.sync();
  await sequelize.close();
}
