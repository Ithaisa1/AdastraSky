/**
 * AdastraSky Backend - Índice de Modelos
 * Exporta todos los modelos de Sequelize
 */

import User from './User.js';
import SkyQualityZone from './SkyQualityZone.js';
import ChatHistory from './ChatHistory.js';
import SkyScore from './SkyScore.js';
import Event from './Event.js';

// Definir relaciones entre modelos
ChatHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatHistory, { foreignKey: 'user_id', as: 'chatHistory' });

export {
  User,
  SkyQualityZone,
  ChatHistory,
  SkyScore,
  Event
};

export default {
  User,
  SkyQualityZone,
  ChatHistory,
  SkyScore,
  Event
};
