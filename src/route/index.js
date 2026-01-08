import express from "express";
import { register, login, sendMessage, getAllUsers, getAllConversations, getAllMessages, 
    getConversationMessages,getUserByEmail,addMembersToGroup,getGroupMembers,getMyGroups,createGroup,
    getGroupMessages} from "../controllers/index";
import { auth } from "../middleware";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get-all-users", getAllUsers);
router.get("/get-all-conversations", getAllConversations);
router.get("/get-all-messages", getAllMessages);
router.post("/send-message", sendMessage);
router.get("/get-received-messages", getConversationMessages);
router.get("/get-user-by-email",getUserByEmail);
router.post("/add-group",auth,createGroup);
router.post("/add-member",auth,addMembersToGroup);
router.get("/groups",auth,getMyGroups);
router.get("/get-group-members",getGroupMembers);
router.get("/received-group-messages",auth,getGroupMessages)

export default router;