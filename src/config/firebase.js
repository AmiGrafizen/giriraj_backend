import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

/* -----------------------------------------
   Detect environment (local vs production)
------------------------------------------ */

const LOCAL_PATH = "D:/giriraj_backend/src/config/serviceAccountKey.json";

// Hostinger VPS path
const VPS_PATH = "/var/www/firebase-key.json";

// Automatically choose path
const KEY_PATH = process.platform === "win32" ? LOCAL_PATH : VPS_PATH;

console.log("🔑 Loading Firebase key from:", KEY_PATH);

const serviceAccount = JSON.parse(readFileSync(KEY_PATH, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const messaging = admin.messaging();
export default admin;
