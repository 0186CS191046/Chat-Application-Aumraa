import Sequelize from "sequelize";
import { sequelize } from "../config/db";
 
export const Group = sequelize.define(
  "Group",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    createdBy: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE(),
      defaultValue:Sequelize.NOW
    },
  },
  {
    freezeTableName: true,
  }
);
 