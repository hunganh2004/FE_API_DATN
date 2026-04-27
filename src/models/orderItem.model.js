import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  pk_order_item_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_order_id:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_product_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_variant_id:    { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  product_name:     { type: DataTypes.STRING(255), allowNull: false },
  unit_price:       { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  quantity:         { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'tbl_order_items', timestamps: false });

export default OrderItem;
