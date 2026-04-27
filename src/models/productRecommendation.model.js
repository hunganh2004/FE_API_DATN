import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductRecommendation = sequelize.define('ProductRecommendation', {
  pk_rec_id:     { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  score:         { type: DataTypes.FLOAT, defaultValue: 0 },
  rec_type:      { type: DataTypes.ENUM('collaborative', 'content_based', 'association', 'trending'), allowNull: false },
  generated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_product_recommendations', timestamps: false });

export default ProductRecommendation;
