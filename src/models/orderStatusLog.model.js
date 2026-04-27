import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderStatusLog = sequelize.define('OrderStatusLog', {
  pk_log_id:     { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_order_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status:        { type: DataTypes.STRING(50), allowNull: false },
  note:          { type: DataTypes.TEXT },
  changed_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fk_changed_by: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
}, { tableName: 'tbl_order_status_logs', timestamps: false });

export default OrderStatusLog;
