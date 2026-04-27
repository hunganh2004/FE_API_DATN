import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  pk_order_id:      { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_coupon_id:     { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  receiver:         { type: DataTypes.STRING(100), allowNull: false },
  phone:            { type: DataTypes.STRING(20), allowNull: false },
  shipping_address: { type: DataTypes.TEXT, allowNull: false },
  subtotal:         { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  discount_amount:  { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  shipping_fee:     { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total:            { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  payment_method:   { type: DataTypes.ENUM('cod', 'bank_transfer', 'momo', 'vnpay'), allowNull: false },
  payment_status:   { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  order_status:     { type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'), defaultValue: 'pending' },
  note:             { type: DataTypes.TEXT },
  created_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_orders', timestamps: false });

export default Order;
