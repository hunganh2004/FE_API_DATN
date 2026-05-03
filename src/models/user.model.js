import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  pk_user_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  full_name:     { type: DataTypes.STRING(100), allowNull: false },
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  phone:         { type: DataTypes.STRING(20) },
  avatar_url:    { type: DataTypes.STRING(500) },
  role:          { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' },
  is_active:          { type: DataTypes.TINYINT, defaultValue: 1 },
  created_at:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_users', timestamps: false });

export default User;
