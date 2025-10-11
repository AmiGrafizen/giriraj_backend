import admin from 'firebase-admin';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';


// __dirname workaround for ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


export const sendNotification = async (token, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    android: { priority: 'high' },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: 'default',
          contentAvailable: true,
        },
      },
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('FCM Send Error:', error);
    return { success: false, error };
  }
};

export const getAccessToken = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../serviceAccountKey2.json'),
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });

  try {
    const accessToken = await auth.getAccessToken();
    return accessToken;
  } catch (error) {
    console.error('Google Auth Token Error:', error);
    throw error;
  }
};
