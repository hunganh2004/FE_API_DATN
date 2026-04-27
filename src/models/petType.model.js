import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PetType = sequelize.define('PetType', {
  pk_pet_type_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
  icon_url:       { type: DataTypes.STRING(500) },
}, { tableName: 'tbl_pet_types', timestamps: false });

export default PetType;
