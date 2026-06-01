import sequelize from '../config/database.js';
import User from '../models/User.js';

const setAdmin = async () => {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email: 'admin@adastra.sky' } });
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log('✅ Admin role set for', user.email);
  }
  console.log(await User.findAll({ attributes: ['email', 'role'] }));
  process.exit(0);
};
setAdmin();
