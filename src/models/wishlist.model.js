import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Wishlist = sequelize.define('Wishlist', {
  pk_wishlist_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_product_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  added_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_wishlists', timestamps: false });

export default Wishlist;
