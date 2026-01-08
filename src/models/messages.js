import Sequelize from "sequelize";
import { sequelize } from "../config/db.js";

export const Message = sequelize.define(
    "Message",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        conversationId: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        groupId:{
 type: Sequelize.INTEGER,
            allowNull:true,
        },
        senderId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        createdAt :{
            type:Sequelize.DATE,
            defaultValue : Sequelize.NOW
        }
    },
    {
        freezeTableName: true,
    }
);
