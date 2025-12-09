import express from "express";
import { register, login, sendMessage, getAllUsers, getAllConversations, getAllMessages, 
    getConversationMessages } from "../controllers/index";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get-all-users", getAllUsers);
router.get("/get-all-conversations", getAllConversations);
router.get("/get-all-messages", getAllMessages);
router.post("/send-message", sendMessage);
router.get("/get-received-messages", getConversationMessages)

export default router;