import admin from "firebase-admin";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// __dirname workaround for ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin initialized successfully");
}

// ✅ Create messaging instance once
const messaging = admin.messaging();

/* ----------------------------------------------------------------
   🔹 Send single notification
---------------------------------------------------------------- */
export const sendNotification = async (token, title, body) => {
  const cleanBody = body?.length > 200 ? body.slice(0, 200) + "..." : body;

  const message = {
    notification: { title, body: cleanBody },
    android: { priority: "high" },
    apns: {
      payload: {
        aps: {
          alert: { title, body: cleanBody },
          sound: "default",
          contentAvailable: true,
        },
      },
    },
    token,
  };

  try {
    const response = await messaging.send(message);
    return { success: true, response };
  } catch (error) {
    console.error("❌ FCM Send Error:", error);
    return { success: false, error };
  }
};

/* ----------------------------------------------------------------
   🔹 Get Google Access Token (for HTTP FCM APIs)
---------------------------------------------------------------- */
export const getAccessToken = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../../serviceAccountKey2.json"),
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  try {
    const accessToken = await auth.getAccessToken();
    return accessToken;
  } catch (error) {
    console.error("❌ Google Auth Token Error:", error);
    throw error;
  }
};

/* ----------------------------------------------------------------
   🔹 Push notification to multiple tokens (safe payload)
---------------------------------------------------------------- */
export const pushNotification = async (tokens, title, body, image) => {
  if (!tokens || tokens.length === 0) throw new Error("No FCM tokens provided");

  const cleanBody = body?.length > 200 ? body.slice(0, 200) + "..." : body;

  // 🚀 Clean base64 images
  let safeImage = "";
  if (image && image.startsWith("data:image")) {
    console.warn("⚠️ Base64 image removed (too large for FCM)");
    safeImage = "";
  } else {
    safeImage = image || "";
  }

  const message = {
    notification: {
      title: title || "Notification",
      body: cleanBody || "",
      image: safeImage,
    },
    data: {
      title: title || "",
      body: cleanBody || "",
      image: safeImage || "",
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
    android: {
      priority: "high",
      notification: {
        sound: "default",
        channelId: "alert-channel",
      },
    },
    apns: {
      payload: {
        aps: {
          alert: { title, body: cleanBody },
          sound: "default",
          contentAvailable: true,
        },
      },
    },
    tokens,
  };

  const size = Buffer.byteLength(JSON.stringify(message));
  console.log("📦 FCM Payload Size:", size, "bytes");

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(
      `✅ Push Notification Sent: ${response.successCount} success, ${response.failureCount} failed`
    );
    return response;
  } catch (error) {
    console.error("❌ Push Notification Error:", error);
    throw error;
  }
};

export default { pushNotification };
