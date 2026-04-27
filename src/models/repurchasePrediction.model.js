import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RepurchasePrediction = sequelize.define('RepurchasePrediction', {
  pk_pred_id:     { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_user_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_product_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  predicted_date: { type: DataTypes.DATEONLY, allowNull: false },
  confidence:     { type: DataTypes.FLOAT, allowNull: false },
  notified:       { type: DataTypes.TINYINT, defaultValue: 0 },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_repurchase_predictions', timestamps: false });

export default RepurchasePrediction;
