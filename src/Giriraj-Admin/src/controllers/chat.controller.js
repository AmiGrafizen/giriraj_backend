import {
  createChatService,
  sendMessageService,
  getMessagesService,
} from "../services/chat.service.js";

/**
 * Create a chat between admin and user
 */
export const createChat = async (req, res) => {
  try {
    const { adminId, userId } = req.body;

    if (!adminId || !userId) {
      return res
        .status(400)
        .json({ message: "Both adminId and userId are required" });
    }

    const chat = await createChatService(adminId, userId);
    return res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user.uid;

    if (!chatId || !text) {
      return res
        .status(400)
        .json({ message: "chatId and text are required" });
    }

    const message = await sendMessageService(chatId, senderId, text);
    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all messages
 */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ message: "chatId parameter is required" });
    }

    const messages = await getMessagesService(chatId);
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: error.message });
  }
};
