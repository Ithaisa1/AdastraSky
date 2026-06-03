import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('meteor_shower', 'eclipse', 'comet', 'planetary', 'conjunction', 'supermoon', 'other'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  peak: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hemisphere: {
    type: DataTypes.STRING(50),
    defaultValue: 'Global'
  },
  moon_phase: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(50),
    defaultValue: 'internal'
  },
  nasa_event_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  visible_from_canarias: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'events',
  indexes: [
    { fields: ['date'] },
    { fields: ['type'] }
  ]
});

export default Event;
