import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserAddress = sequelize.define('UserAddress', {
  pk_address_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  receiver:      { type: DataTypes.STRING(100), allowNull: false },
  phone:         { type: DataTypes.STRING(20), allowNull: false },
  province:      { type: DataTypes.STRING(100), allowNull: false },
  commune:       { type: DataTypes.STRING(100), allowNull: false },
  street:        { type: DataTypes.STRING(255), allowNull: false },
  is_default:    { type: DataTypes.TINYINT, defaultValue: 0 },
}, { tableName: 'tbl_user_addresses', timestamps: false });

export default UserAddress;
