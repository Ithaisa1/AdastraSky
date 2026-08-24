import sequelize from '../backend/src/config/database.js';
import '../backend/src/models/index.js';

async function syncAll() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    await sequelize.sync();
    console.log('✅ Todas las tablas sincronizadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

syncAll();