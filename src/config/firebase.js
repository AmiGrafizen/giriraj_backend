import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// three levels up from src/Giriraj-Admin/src/config/ → project root
dotenv.config({ path: path.resolve(__dirname, "../../config.env") });

console.log('process.env.FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID)

if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) throw new Error("Missing Firebase credentials in config.env");


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:  process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  console.log("Firebase Admin initialized via env vars");
}

export const db         = admin.firestore();
export const auth       = admin.auth();
export const messaging  = admin.messaging();
export default admin;
