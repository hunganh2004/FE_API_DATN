import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define('CartItem', {
  pk_cart_item_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_product_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_variant_id:   { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  quantity:        { type: DataTypes.INTEGER, defaultValue: 1 },
  added_at:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_cart_items', timestamps: false });

export default CartItem;
