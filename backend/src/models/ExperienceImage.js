/**
 * AdastraSky Backend - Imágenes de experiencias
 *
 * Las imágenes se guardan en PostgreSQL (ya redimensionadas a WebP) en lugar de
 * en el disco del servidor: el disco de Render es efímero y se perdían en cada
 * redespliegue. Así todo el contenido viaja con la base de datos al migrarla.
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExperienceImage = sequelize.define('ExperienceImage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  experience_id: { type: DataTypes.UUID, allowNull: true },
  mime_type: { type: DataTypes.STRING(50), allowNull: false },
  size_bytes: { type: DataTypes.INTEGER, allowNull: false },
  width: { type: DataTypes.INTEGER, allowNull: true },
  height: { type: DataTypes.INTEGER, allowNull: true },
  data: { type: DataTypes.BLOB, allowNull: false }
}, {
  tableName: 'experience_images',
  updatedAt: false,
  indexes: [{ fields: ['experience_id'] }]
});

export default ExperienceImage;
