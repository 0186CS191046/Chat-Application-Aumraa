import { User } from "./user.js";
import { Conversation } from "./conversation.js";
import { Message } from "./messages.js";
import { Group } from "./group.js";
import { GroupMember } from "./group-member.js";

/* Conversation ↔ Users */
Conversation.belongsTo(User, { foreignKey: "userId1", as: "user1" });
Conversation.belongsTo(User, { foreignKey: "userId2", as: "user2" });

User.hasMany(Conversation, { foreignKey: "userId1", as: "conversations1" });
User.hasMany(Conversation, { foreignKey: "userId2", as: "conversations2" });

/* Conversation ↔ Messages */
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

/* Message ↔ Sender */
Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
});

Group.hasMany(GroupMember,{foreignKey:"groupId", as: "members",onDelete:"CASCADE"})
GroupMember.belongsTo(Group,{foreignKey:"groupId", as :"group"})
User.hasMany(GroupMember, {
  foreignKey: "userId",
  as: "groupMemberships",
});

GroupMember.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, Message, Conversation };
