import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const publishMessage = async (channel, data) => {
  try {
    await axios.post(
      process.env.CENTRIFUGO_URL,
      {
        method: "publish",
        params: { channel, data },
      },
      {
        headers: {
          Authorization: `apikey ${process.env.CENTRIFUGO_API_KEY}`,
        },
      }
    );
  } catch (error) {
    console.error("Error publishing to Centrifugo:", error.message);
  }
};
