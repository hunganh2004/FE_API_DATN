import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  pk_notif_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  type:        { type: DataTypes.ENUM('order_update', 'repurchase_reminder', 'promotion', 'system'), allowNull: false },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  message:     { type: DataTypes.TEXT, allowNull: false },
  is_read:     { type: DataTypes.TINYINT, defaultValue: 0 },
  ref_id:      { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_notifications', timestamps: false });

export default Notification;
