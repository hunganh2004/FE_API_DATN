import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CustomerSegment = sequelize.define('CustomerSegment', {
  pk_segment_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:          { type: DataTypes.STRING(100), allowNull: false },
  description:   { type: DataTypes.TEXT },
}, { tableName: 'tbl_customer_segments', timestamps: false });

export default CustomerSegment;
