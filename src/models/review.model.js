import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  pk_review_id:  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_user_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_parent_id:  { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  rating:        { type: DataTypes.TINYINT, validate: { min: 1, max: 5 } },
  comment:       { type: DataTypes.TEXT },
  created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_reviews', timestamps: false });

export default Review;
