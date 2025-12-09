import { User } from "./user";
import { Conversation } from "./conversation";
import { Message } from "./messages";

Conversation.belongsTo(User,{foreignKey:"userId1", as:"user1"});
Conversation.belongsTo(User,{foreignKey:"userId2", as :"user2"});

Conversation.hasMany(Message,{foreignKey:"conversationId",as :"messages"});

Message.belongsTo(User,{foreignKey:"senderId", as:"sender"});

export {User,Message,Conversation};
