import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserBehaviorLog = sequelize.define('UserBehaviorLog', {
  pk_log_id:     { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:    { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  session_id:    { type: DataTypes.STRING(100), allowNull: false },
  fk_product_id: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  action:        { type: DataTypes.ENUM('view', 'search', 'add_to_cart', 'remove_from_cart', 'purchase', 'wishlist'), allowNull: false },
  search_query:  { type: DataTypes.STRING(255), defaultValue: null },
  duration_sec:  { type: DataTypes.INTEGER, defaultValue: null },
  created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_user_behavior_logs', timestamps: false });

export default UserBehaviorLog;
