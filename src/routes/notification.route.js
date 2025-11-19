import express from 'express';
import { createNotification, handleSendNotification, registerFcmToken } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/send', handleSendNotification);

router.post("/register", registerFcmToken);

router.post("/push", createNotification);

export default router;
