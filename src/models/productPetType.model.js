import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductPetType = sequelize.define('ProductPetType', {
  fk_product_id:  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  fk_pet_type_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
}, { tableName: 'tbl_product_pet_types', timestamps: false });

export default ProductPetType;
