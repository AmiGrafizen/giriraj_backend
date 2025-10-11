import { db } from "../config/firebase.js";

/**
 * Create chat between admin and user
 */
export const createChatService = async (adminId, userId) => {
  // Check if chat already exists between these two users
  const existingChats = await db
    .collection("chats")
    .where("members", "array-contains", userId)
    .get();

  if (!existingChats.empty) {
    const chatDoc = existingChats.docs.find((doc) =>
      doc.data().members.includes(adminId)
    );
    if (chatDoc) return { chatId: chatDoc.id, ...chatDoc.data() };
  }

  // Create new chat
  const chatRef = db.collection("chats").doc();
  const chatData = {
    members: [adminId, userId],
    lastMessage: "",
    lastUpdated: new Date(),
  };

  await chatRef.set(chatData);
  return { chatId: chatRef.id, ...chatData };
};

/**
 * Send message
 */
export const sendMessageService = async (chatId, senderId, text) => {
  const messageRef = db
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc();

  const messageData = {
    senderId,
    text,
    timestamp: new Date(),
    seen: false,
  };

  await messageRef.set(messageData);

  // Update chat meta
  await db.collection("chats").doc(chatId).set(
    {
      lastMessage: text,
      lastUpdated: new Date(),
    },
    { merge: true }
  );

  return { messageId: messageRef.id, ...messageData };
};

/**
 * Get all messages in a chat
 */
export const getMessagesService = async (chatId) => {
  const snapshot = await db
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .orderBy("timestamp", "asc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
