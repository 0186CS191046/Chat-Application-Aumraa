import Sequelize from "sequelize";
import { sequelize } from "../config/db";
 
export const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId1: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId2: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
 