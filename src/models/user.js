import Sequelize from "sequelize";
import { sequelize } from "../config/db";
 
export const User = sequelize.define(
  "User",
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
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique:true
    },
    phone:{
        type: Sequelize.STRING(255),
      allowNull: false,
      unique:true
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    token: {
      type: Sequelize.TEXT(),
      defaultValue:""
    },
  },
  {
    freezeTableName: true,
  }
);
 