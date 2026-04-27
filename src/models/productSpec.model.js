import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductSpec = sequelize.define('ProductSpec', {
  pk_spec_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  spec_name:     { type: DataTypes.STRING(100), allowNull: false },
  spec_value:    { type: DataTypes.STRING(255), allowNull: false },
  sort_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'tbl_product_specs', timestamps: false });

export default ProductSpec;
