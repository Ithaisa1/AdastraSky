import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SkyScore = sequelize.define('SkyScore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  overall_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 }
  },
  astro_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: { min: 0, max: 10 }
  },
  photo_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: { min: 0, max: 10 }
  },
  tourism_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: { min: 0, max: 10 }
  },
  avg_bortle: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  avg_cloudiness: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  avg_humidity: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  avg_wind_speed: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  avg_temperature: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  moon_phase: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  moon_illumination: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  avg_light_pollution: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(20),
    defaultValue: 'n8n'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sky_scores',
  indexes: [
    { fields: ['date'] },
    { fields: ['overall_score'] }
  ]
});

export default SkyScore;
