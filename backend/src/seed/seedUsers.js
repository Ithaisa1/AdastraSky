/**
 * Script de Seed para crear usuarios demo y admin
 * Ejecutar con: node src/seed/seedUsers.js
 */

import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import sequelize from '../config/database.js';
import User from '../models/User.js';

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');

    await sequelize.sync();

    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log('⚠️  Ya existen usuarios en la base de datos');
      console.log('Usuarios existentes:', existingUsers.map(u => u.email));

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const response = await rl.question('¿Deseas eliminar los usuarios existentes y recrearlos? (s/n): ');
      rl.close();

      if (response.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        process.exit(0);
      }

      await User.destroy({ where: {} });
      console.log('🗑️  Usuarios eliminados');
    }

    const saltRounds = 10;
    const demoPassword = await bcrypt.hash('demo123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    await User.create({
      email: 'demo@adastra.sky',
      password: demoPassword,
      first_name: 'Usuario',
      last_name: 'Demo',
      preferred_language: 'es',
      is_active: true,
    });

    await User.create({
      email: 'admin@adastra.sky',
      password: adminPassword,
      first_name: 'Administrador',
      last_name: 'Sistema',
      preferred_language: 'es',
      is_active: true,
    });

    console.log('\n✅ Usuarios creados exitosamente:\n');
    console.log('👤 USUARIO DEMO:');
    console.log('   Email: demo@adastra.sky');
    console.log('   Contraseña: demo123');
    console.log('   Rol: Usuario estándar\n');

    console.log('👤 USUARIO ADMIN:');
    console.log('   Email: admin@adastra.sky');
    console.log('   Contraseña: admin123');
    console.log('   Rol: Administrador\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    process.exit(1);
  }
};

seedUsers();
