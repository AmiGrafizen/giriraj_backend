// src/centrifugo/centrifugoClient.js
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../../config.env") });

export const publishToCentrifugo = async (channel, data) => {
  const centrifugoUrl = process.env.CENTRIFUGO_URL || "http://localhost:8000";
  const apiKey = process.env.CENTRIFUGO_API_KEY;

  try {
    console.log("🧭 CENTRIFUGO DEBUG:");
    console.log("➡ URL:", centrifugoUrl);
    console.log("➡ API Key:", apiKey ? apiKey : "(missing)");
    console.log("➡ Channel:", channel);
    console.log("➡ Data:", data);

    const response = await axios.post(
      `${centrifugoUrl}/api/publish`,
      { channel, data },
      {
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Centrifugo: Published to ${channel}`);
    return response.data;
  } catch (err) {
    console.error("Centrifugo publish failed");
    console.log("📋 URL:", centrifugoUrl);
    console.log("📋 Sent Header:", { "X-API-Key": apiKey });
    console.log("📋 Status:", err.response?.status || err.message);
    console.log("📋 Response:", err.response?.data || err.message);
  }
};
