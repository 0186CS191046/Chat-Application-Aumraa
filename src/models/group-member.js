import Sequelize from "sequelize";
import { sequelize } from "../config/db.js";
 
export const GroupMember = sequelize.define(
  "GroupMember",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
role: {
      type: Sequelize.STRING,
      defaultValue:"member"
    },
  },
  {
    freezeTableName: true,
  }
);
 