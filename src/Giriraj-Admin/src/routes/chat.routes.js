import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createChat,
  sendMessage,
  getMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createChat);

router.post("/send", verifyToken, sendMessage);

router.get("/:chatId", verifyToken, getMessages);

export default router;
