/**
 * AdastraSky Backend - Modelo SkyQualityZone
 * Zonas de calidad del cielo (Santuarios Estelares)
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SkyQualityZone = sequelize.define('SkyQualityZone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  island: {
    type: DataTypes.ENUM('Gran Canaria', 'Tenerife', 'La Palma', 'Lanzarote', 'Fuerteventura', 'El Hierro', 'La Gomera', 'La Graciosa'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('observatory', 'astronomical_viewpoint', 'landscape_viewpoint'),
    allowNull: false
  },
  bortle_scale: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 9
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  altitude: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Altitud en metros sobre el nivel del mar'
  },
  accessibility: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  streaming_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sky_quality_zones',
  indexes: [
    {
      fields: ['island']
    },
    {
      fields: ['category']
    },
    {
      fields: ['bortle_scale']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

export default SkyQualityZone;
