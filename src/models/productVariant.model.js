import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariant = sequelize.define('ProductVariant', {
  pk_variant_id:  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_product_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name:           { type: DataTypes.STRING(100), allowNull: false },
  sku:            { type: DataTypes.STRING(100), unique: true },
  price:          { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  sale_price:     { type: DataTypes.DECIMAL(12, 2), defaultValue: null },
  stock:          { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'tbl_product_variants', timestamps: false });

export default ProductVariant;
