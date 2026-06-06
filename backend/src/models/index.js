/**
 * AdastraSky Backend - Índice de Modelos
 * Exporta todos los modelos de Sequelize
 */

import User from './User.js';
import SkyQualityZone from './SkyQualityZone.js';
import ChatHistory from './ChatHistory.js';
import SkyScore from './SkyScore.js';
import Event from './Event.js';
import Experience from './Experience.js';

// Definir relaciones entre modelos
ChatHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatHistory, { foreignKey: 'user_id', as: 'chatHistory' });

Experience.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
User.hasMany(Experience, { foreignKey: 'user_id', as: 'experiences' });

export {
  User,
  SkyQualityZone,
  ChatHistory,
  SkyScore,
  Event,
  Experience
};

export default {
  User,
  SkyQualityZone,
  ChatHistory,
  SkyScore,
  Event,
  Experience
};
