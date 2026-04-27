import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  pk_product_id:  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name:           { type: DataTypes.STRING(255), allowNull: false },
  slug:           { type: DataTypes.STRING(280), allowNull: false, unique: true },
  description:    { type: DataTypes.TEXT },
  price:          { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  sale_price:     { type: DataTypes.DECIMAL(12, 2), defaultValue: null },
  stock:          { type: DataTypes.INTEGER, defaultValue: 0 },
  sku:            { type: DataTypes.STRING(100), unique: true },
  brand:          { type: DataTypes.STRING(100) },
  weight_gram:    { type: DataTypes.INTEGER },
  is_consumable:  { type: DataTypes.TINYINT, defaultValue: 0 },
  is_active:      { type: DataTypes.TINYINT, defaultValue: 1 },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_products', timestamps: false });

export default Product;
