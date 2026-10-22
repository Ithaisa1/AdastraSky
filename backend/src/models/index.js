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
import ContactMessage from './ContactMessage.js';
import ExperienceImage from './ExperienceImage.js';

// Definir relaciones entre modelos
ChatHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatHistory, { foreignKey: 'user_id', as: 'chatHistory' });

Experience.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
User.hasMany(Experience, { foreignKey: 'user_id', as: 'experiences' });

ExperienceImage.belongsTo(Experience, { foreignKey: 'experience_id', as: 'experience', constraints: false });

export {
  User,
  SkyQualityZone,
  ChatHistory,
  SkyScore,
  Event,
  Experience,
  ContactMessage,
  ExperienceImage
};

export default {
  User,
  SkyQualityZone,
  ChatHistory,
  SkyScore,
  Event,
  Experience,
  ContactMessage,
  ExperienceImage
};
