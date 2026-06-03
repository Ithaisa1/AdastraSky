import sequelize from '../backend/src/config/database.js';
import SkyQualityZone from '../backend/src/models/SkyQualityZone.js';

const ZONES = [
  {
    name: 'Observatorio del Teide', island: 'Tenerife', municipality: 'La Orotava',
    category: 'observatory', subcategory: 'scientific', bortle_scale: 2,
    latitude: 28.3012, longitude: -16.5100, altitude: 2390,
    access_type: 'car', accessibility: 'Acceso restringido - requiere permiso IAC',
    has_parking: true, night_access: false, description: 'Principal observatorio del IAC en Tenerife.',
    image_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
  },
  {
    name: 'Observatorio Roque de los Muchachos', island: 'La Palma', municipality: 'Garafía',
    category: 'observatory', subcategory: 'scientific', bortle_scale: 2,
    latitude: 28.7590, longitude: -17.8774, altitude: 2396,
    access_type: 'car', accessibility: 'Acceso restringido - visitas guiadas',
    has_parking: true, night_access: false, description: 'Observatorio internacional en La Palma.',
    image_url: 'https://images.unsplash.com/photo-1444084316824-dc26d6657664?w=800',
  },
  {
    name: 'Mirador del Pico del Inglés', island: 'Gran Canaria', municipality: 'San Bartolomé de Tirajana',
    category: 'astronomical_viewpoint', subcategory: 'starlight', bortle_scale: 3,
    latitude: 27.9385, longitude: -15.5692, altitude: 1350,
    access_type: 'car', accessibility: 'Público - acceso en coche',
    has_parking: true, night_access: true, description: 'Mirador Starlight con vistas espectaculares.',
    image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
  },
  {
    name: 'Mirador de Chipeque', island: 'Tenerife', municipality: 'La Orotava',
    category: 'astronomical_viewpoint', subcategory: 'hidden_spot', bortle_scale: 3,
    latitude: 28.2650, longitude: -16.3250, altitude: 2240,
    access_type: 'car', accessibility: 'Público - acceso por carretera',
    has_parking: true, night_access: true, description: 'Mirador de alta montaña con cielos oscuros.',
  },
  {
    name: 'Llano del Jable', island: 'Lanzarote', municipality: 'Yaiza',
    category: 'astronomical_viewpoint', subcategory: 'dark_zone', bortle_scale: 3,
    latitude: 29.0366, longitude: -13.7511, altitude: 180,
    access_type: 'car', accessibility: 'Público - fácil acceso',
    has_parking: true, night_access: true, description: 'Zona de cielos oscuros en Lanzarote.',
  },
  {
    name: 'Morro Velosa', island: 'Fuerteventura', municipality: 'Betancuria',
    category: 'astronomical_viewpoint', subcategory: 'starlight', bortle_scale: 2,
    latitude: 28.3589, longitude: -14.3206, altitude: 690,
    access_type: 'car', accessibility: 'Público - carretera de tierra',
    has_parking: true, night_access: true, description: 'Zona Starlight certificada en Fuerteventura.',
  },
  {
    name: 'Mirador de Sicasumbre', island: 'La Palma', municipality: 'El Paso',
    category: 'astronomical_viewpoint', subcategory: 'natural_observatory', bortle_scale: 2,
    latitude: 28.6833, longitude: -17.8667, altitude: 1200,
    access_type: 'car', accessibility: 'Público - acceso en coche',
    has_parking: true, night_access: true, description: 'Mirador astronómico en La Palma.',
  },
  {
    name: 'Mirador del Santo', island: 'La Gomera', municipality: 'San Sebastián de La Gomera',
    category: 'astronomical_viewpoint', subcategory: 'starlight', bortle_scale: 2,
    latitude: 28.1122, longitude: -17.2050, altitude: 870,
    access_type: '4x4', accessibility: 'Público - recomendado 4x4',
    has_parking: false, night_access: true, description: 'Mirador Starlight en La Gomera.',
  },
  {
    name: 'Mirador de Jinama', island: 'El Hierro', municipality: 'Valverde',
    category: 'astronomical_viewpoint', subcategory: 'natural_observatory', bortle_scale: 1,
    latitude: 27.7800, longitude: -17.9600, altitude: 1300,
    access_type: 'car', accessibility: 'Público - acceso en coche',
    has_parking: true, night_access: true, description: 'Cielos Bortle 1 en El Hierro.',
  },
  {
    name: 'Centro de La Graciosa', island: 'La Graciosa', municipality: 'Teguise',
    category: 'landscape_viewpoint', subcategory: 'coast', bortle_scale: 1,
    latitude: 29.2306, longitude: -13.5222, altitude: 80,
    access_type: 'hike', accessibility: 'Público - ferry + senderismo',
    has_parking: false, night_access: true, description: 'Cielos prístinos Bortle 1 en La Graciosa.',
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');

    const existing = await SkyQualityZone.count();
    if (existing > 0) {
      console.log(`⚠️  Ya existen ${existing} zonas. Se eliminarán y recrearán.`);
      await SkyQualityZone.destroy({ where: {} });
    }

    const created = await SkyQualityZone.bulkCreate(ZONES);
    console.log(`✅ ${created.length} zonas de cielo insertadas correctamente`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
