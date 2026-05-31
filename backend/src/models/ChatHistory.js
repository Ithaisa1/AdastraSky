/**
 * AdastraSky Backend - Modelo ChatHistory
 * Historial de conversaciones con el Agente de IA
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChatHistory = sequelize.define('ChatHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  session_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM('es', 'en', 'de'),
    defaultValue: 'es',
    allowNull: false
  },
  sources: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Fuentes citadas por el agente de IA'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadatos adicionales de la conversación'
  }
}, {
  tableName: 'chat_history',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default ChatHistory;
