/**
 * Elimina un usuario y todos sus datos (conversaciones, experiencias e imágenes)
 * en una transacción. Lo usan el borrado de cuenta del propio usuario y el
 * borrado definitivo desde administración.
 */
import sequelize from '../config/database.js';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js';
import Experience from '../models/Experience.js';
import ExperienceImage from '../models/ExperienceImage.js';
import { deleteImagesByUrls } from '../utils/imageStore.js';

export async function purgeUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) return false;
  const experiences = await Experience.findAll({ where: { user_id: userId }, attributes: ['id', 'images'] });
  const imageUrls = experiences.flatMap((e) => e.images || []);
  await sequelize.transaction(async (transaction) => {
    await ChatHistory.destroy({ where: { user_id: userId }, transaction });
    if (experiences.length) {
      await ExperienceImage.destroy({ where: { experience_id: experiences.map((e) => e.id) }, transaction });
    }
    await Experience.destroy({ where: { user_id: userId }, transaction });
    await user.destroy({ transaction });
  });
  await deleteImagesByUrls(imageUrls); // ficheros antiguos en disco, si los hubiera
  return true;
}
