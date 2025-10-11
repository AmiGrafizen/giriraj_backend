import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, "./serviceAccountKey.json");

let serviceAccount;
try {
  const rawKey = fs.readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(rawKey);
  console.log("Firebase service account loaded successfully");
} catch (error) {
  console.error("Failed to load Firebase service account:", error.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized");
} else {
  console.log("Firebase already initialized");
}

export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
     