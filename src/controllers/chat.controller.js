// import {
//   createChatService,
//   sendMessageService,
//   getMessagesService,
// } from "../services/chat.service.js";

// /**
//  * Create a chat between admin and user
//  */
// export const createChat = async (req, res) => {
//   try {
//     const { adminId, userId } = req.body;

//     if (!adminId || !userId) {
//       return res
//         .status(400)
//         .json({ message: "Both adminId and userId are required" });
//     }

//     const chat = await createChatService(adminId, userId);
//     return res.status(201).json(chat);
//   } catch (error) {
//     console.error("Error creating chat:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// /**
//  * Send a message
//  */
// export const sendMessage = async (req, res) => {
//   try {
//     const { chatId, text } = req.body;
//     const senderId = req.user.uid;

//     if (!chatId || !text) {
//       return res
//         .status(400)
//         .json({ message: "chatId and text are required" });
//     }

//     const message = await sendMessageService(chatId, senderId, text);
//     return res.status(201).json(message);
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// /**
//  * Get all messages
//  */
// export const getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     if (!chatId) {
//       return res.status(400).json({ message: "chatId parameter is required" });
//     }

//     const messages = await getMessagesService(chatId);
//     return res.status(200).json(messages);
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };


import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { publishMessage } from "../services/centrifugo.service.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../config.env") });

// Generate JWT for Centrifugo connection
export const generateCentrifugoToken = (req, res) => {
  try {
    // Normally this would be your logged-in user
    const user = { id: "user_" + Date.now(), name: "John Doe" };

    const token = jwt.sign(
      { sub: user.id, name: user.name },
      process.env.CENTRIFUGO_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("JWT generation error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send chat message via Centrifugo
export const sendMessage = async (req, res) => {
  try {
    const { message, room, user } = req.body;
    await publishMessage(room, { message, user });
    res.json({ success: true });
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

