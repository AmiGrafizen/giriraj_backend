import express from 'express';
import { handleSendNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/send', handleSendNotification);

export default router;
