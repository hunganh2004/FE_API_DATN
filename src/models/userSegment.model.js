import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserSegment = sequelize.define('UserSegment', {
  fk_user_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  fk_segment_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  assigned_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_user_segments', timestamps: false });

export default UserSegment;
