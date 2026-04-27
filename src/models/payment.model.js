import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  pk_payment_id:   { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_order_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
  method:          { type: DataTypes.ENUM('cod', 'bank_transfer', 'momo', 'vnpay'), allowNull: false },
  transaction_ref: { type: DataTypes.STRING(255) },
  amount:          { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status:          { type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'), defaultValue: 'pending' },
  paid_at:         { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'tbl_payments', timestamps: false });

export default Payment;
