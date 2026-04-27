import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AssociationRule = sequelize.define('AssociationRule', {
  pk_rule_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fk_antecedent: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fk_consequent: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  support:       { type: DataTypes.FLOAT, allowNull: false },
  confidence:    { type: DataTypes.FLOAT, allowNull: false },
  lift:          { type: DataTypes.FLOAT, allowNull: false },
  updated_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tbl_association_rules', timestamps: false });

export default AssociationRule;
