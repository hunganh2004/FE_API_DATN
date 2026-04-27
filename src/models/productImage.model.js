import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductImage = sequelize.define('ProductImage', {
  pk_image_id:   { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  image_url:     { type: DataTypes.STRING(500), allowNull: false },
  is_primary:    { type: DataTypes.TINYINT, defaultValue: 0 },
  sort_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'tbl_product_images', timestamps: false });

export default ProductImage;
