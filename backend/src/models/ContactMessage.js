import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true }
  },
  subject: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'contact_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ContactMessage;
