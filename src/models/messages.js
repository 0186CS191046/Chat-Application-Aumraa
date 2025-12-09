import Sequelize from "sequelize";
import { sequelize } from "../config/db";

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
            allowNull: false,
        },
        senderId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING(255),
            allowNull: false
        }
    },
    {
        freezeTableName: true,
    }
);
