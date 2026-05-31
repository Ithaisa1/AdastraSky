/**
 * Script de Seed para crear usuarios demo y admin
 * Ejecutar con: node src/seed/seedUsers.js
 */

import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import User from '../models/User.js';

const seedUsers = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');

    // Sincronizar modelo (crear tabla si no existe)
    await sequelize.sync();

    // Verificar si ya existen usuarios
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log('⚠️  Ya existen usuarios en la base de datos');
      console.log('Usuarios existentes:', existingUsers.map(u => u.email));
      
      const response = await require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      }).question('¿Deseas eliminar los usuarios existentes y recrearlos? (s/n): ');

      if (response.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        process.exit(0);
      }

      await User.destroy({ where: {} });
      console.log('🗑️  Usuarios eliminados');
    }

    // Hashear contraseñas
    const saltRounds = 10;
    const demoPassword = await bcrypt.hash('demo123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    // Crear usuario demo
    const demoUser = await User.create({
      email: 'demo@adastra.sky',
      password: demoPassword,
      first_name: 'Usuario',
      last_name: 'Demo',
      preferred_language: 'es',
      is_active: true,
    });

    // Crear usuario admin
    const adminUser = await User.create({
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
