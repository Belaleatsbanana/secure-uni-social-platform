import express from "express";
import { getConversations, getMessages, sendMessage } from "../controllers/messages.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getConversations);
router.get("/:friendId", verifyToken, getMessages);

/* CREATE */
router.post("/", verifyToken, sendMessage);

export default router;
