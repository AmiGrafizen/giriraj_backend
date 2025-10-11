import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Support __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account key
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

// Load and parse the service account
let serviceAccount = null;
try {
  const rawKey = fs.readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(rawKey);
  console.log("✅ Firebase service account loaded successfully");
} catch (err) {
  console.error("❌ Failed to load Firebase service account:", err.message);
  process.exit(1); // Stop app if the key is missing or invalid
}
console.log('serviceAccount', serviceAccount)

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin SDK initialized");
} else {
  console.log("⚙️ Firebase already initialized");
}

export default admin;
