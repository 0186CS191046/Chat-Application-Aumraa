import Sequelize from "sequelize";
import { sequelize } from "../config/db.js";
 
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
       indexes: [
  {
    unique: true,
    fields: ["userId1", "userId2"]
  }
]
  }
);
 