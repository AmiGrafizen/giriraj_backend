import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment from central_backend/config.env
dotenv.config({
  path: path.resolve(__dirname, "../../../../config.env"),
});

console.log("✅ ENV loaded from:", path.resolve(__dirname, "../../../../config.env"));


const APP_ID = process.env.COMETCHAT_APP_ID;
const REGION = process.env.COMETCHAT_REGION?.toLowerCase();
const API_KEY = process.env.COMETCHAT_API_KEY;

const BASE_URL = `https://${APP_ID}.api-${REGION}.cometchat.io/v3`;

/* 🟢 Ensure CometChat user exists */
export async function ensureCometUser(uid, name, avatar = "") {
  try {
    await axios.post(
      `${BASE_URL}/users`,
      { uid, name, avatar },
      {
        headers: {
          apiKey: API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log(`✅ CometChat user ensured: ${uid}`);
  } catch (err) {
    if (err.response?.data?.error?.code === "ERR_UID_EXISTS") {
      console.log(`⚠️ User already exists: ${uid}`);
    } else {
      console.error("❌ CometChat user creation failed:", err.response?.data || err.message);
      throw new Error("CometChat user creation failed");
    }
  }
}

/* 🔑 Generate CometChat Auth Token */
export async function generateCometAuthToken(uid) {
  try {
    const res = await axios.post(
      `${BASE_URL}/users/${uid}/auth_tokens`,
      {},
      {
        headers: {
          apiKey: API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const token = res.data?.data?.authToken;
    if (!token) throw new Error("Missing CometChat token in response");
    console.log(`✅ CometChat token generated for: ${uid}`);
    return token;
  } catch (err) {
    console.error("❌ CometChat token generation failed:", err.response?.data || err.message);
    throw new Error("CometChat token generation failed");
  }
}