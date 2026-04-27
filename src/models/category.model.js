import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  pk_category_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_parent_id:   { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  name:           { type: DataTypes.STRING(100), allowNull: false },
  slug:           { type: DataTypes.STRING(120), allowNull: false, unique: true },
  description:    { type: DataTypes.TEXT },
  image_url:      { type: DataTypes.STRING(500) },
  sort_order:     { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active:      { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'tbl_categories', timestamps: false });

export default Category;
