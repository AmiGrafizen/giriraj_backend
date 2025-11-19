import { ensureCometUser, generateCometAuthToken } from "../services/cometChat.service.js";

/**
 * POST /api/cometchat/get-token
 * Creates/ensures a CometChat user and returns an auth token
 */
export const getCometTokenController = async (req, res) => {
  try {
    const { userId, userType, name, avatar } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ success: false, message: "userId and userType are required" });
    }

    const uid = `${userType}_${userId}`;
    const displayName = name || "Giriraj User";
    const displayAvatar = avatar || "";

    // 🟢 Ensure user exists on CometChat
    await ensureCometUser(uid, displayName, displayAvatar);

    // 🟢 Generate a new token
    const token = await generateCometAuthToken(uid);

    return res.status(200).json({
      success: true,
      token,
      uid,
    });
  } catch (error) {
    console.error("❌ getCometTokenController Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate CometChat token",
      error: error.response?.data || error.message,
    });
  }
};
  