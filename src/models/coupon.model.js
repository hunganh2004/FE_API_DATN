import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Coupon = sequelize.define('Coupon', {
  pk_coupon_id:   { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
  discount_type:  { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false },
  discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  min_order:      { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  max_uses:       { type: DataTypes.INTEGER, defaultValue: null },
  used_count:     { type: DataTypes.INTEGER, defaultValue: 0 },
  starts_at:      { type: DataTypes.DATE },
  expires_at:     { type: DataTypes.DATE },
  is_active:      { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'tbl_coupons', timestamps: false });

export default Coupon;
