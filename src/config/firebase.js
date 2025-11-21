import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load the correct config.env path
dotenv.config({
  path: path.resolve(__dirname, "../../config.env")
});

// Debug logs to verify ENV loaded correctly
console.log("🔥 FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("🔥 FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("🔥 FIREBASE_PRIVATE_KEY starts with:", process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30));

/* ----------- VALIDATION ----------- */
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  throw new Error("❌ Missing Firebase credentials in config.env");
}

/* ----------- INITIALIZE FIREBASE ----------- */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  console.log("✅ Firebase Admin initialized using ENV variables");
}

/* ----------- EXPORTS ----------- */
export const db        = admin.firestore();
export const auth      = admin.auth();
export const messaging = admin.messaging();

export default admin;
