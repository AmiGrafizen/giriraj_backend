// controllers/notification.controller.js
import { sendNotification } from '../services/notification.service.js';

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
