// controllers/notification.controller.js
import { girirajModels } from '../db/index.js';
import notificationService, { sendNotification } from '../services/notification.service.js';

export const handleSendNotification = async (req, res) => {
  try {
    const { token, title, body } = req.body;

    // Validate request
    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, title, or body',
      });
    }

    // Send push notification
    const response = await sendNotification(token, title, body);

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      response,
    });
  } catch (error) {
    console.error('Notification Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
};


/**
 * @desc Send a notification to one or more selected users
 * @route POST /api/notifications/send
 */
export const createNotification = async (req, res) => {
  try {
const { title, body, image, userEmails } = req.body;

    // ✅ Validate input
    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required." });
    }
    if (!Array.isArray(userEmails) || userEmails.length === 0) {
      return res.status(400).json({ error: "userIds must be a non-empty array." });
    }

    // ✅ Find users and collect all FCM tokens
const users = await girirajModels?.GIRIRAJUser?.find({ email: { $in: userEmails.map(e => e.toLowerCase()) } });
    const tokens = users?.flatMap((user) => user.fcmTokens || []);

    if (tokens?.length === 0) {
      return res.status(404).json({ error: "No FCM tokens found for selected users." });
    }

    // ✅ Send via Firebase service
    const result = await notificationService.pushNotification(tokens, title, body, image);

    return res.status(200).json({
      success: true,
      message: "Notifications sent successfully.",
      result,
    });
  } catch (error) {
    console.error("❌ Notification Controller Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Register or update a user’s FCM token
 * @route POST /api/notifications/register
 */
export const registerFcmToken = async (req, res) => {
  try {
    const { email, fcmToken } = req.body;

if (!email || !fcmToken) {
  return res.status(400).json({ error: "email and fcmToken are required." });
}

const user = await girirajModels?.GIRIRAJUser?.findOne({ email: email.toLowerCase() });


    if (!user) return res.status(404).json({ error: "User not found." });

    // ✅ Avoid duplicates
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "FCM token registered successfully.",
      fcmTokens: user.fcmTokens,
    });
  } catch (error) {
    console.error("Register Token Error:", error);
    res.status(500).json({ error: error.message });
  }
};
