import axios from "axios";
import { URLSearchParams } from "url";

function normalizePhoneNumber(rawNumber) {
  let num = rawNumber.toString().trim();
  if (num.startsWith("+")) num = num.slice(1);
  if (num.startsWith("91")) return num;
  if (/^\d{10}$/.test(num)) return `91${num}`;
  throw new Error(`❌ Invalid phone number format: ${rawNumber}`);
}

export const sendWhatsAppMessage = async ({ phoneNumber, patientName }) => {
  const API_TOKEN =
    process.env.WHATSAPP_API_TOKEN ||
    "13732|HuU2OF3rdCVfHeHiRNq8zk5R7hlFfhiObaMRYo7F7c2b1c55";

  const PHONE_NUMBER_ID = "326604337198242";
  const TEMPLATE_ID = "243162"; // use correct one from API example

  try {
    if (!phoneNumber) throw new Error("❌ Missing 'phoneNumber'");
    if (!patientName) throw new Error("❌ Missing 'patientName'");

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const url = "https://chat.grafizen.com/api/v1/whatsapp/send/template";

    const payload = new URLSearchParams({
      apiToken: API_TOKEN,
      phone_number_id: PHONE_NUMBER_ID,
      template_id: TEMPLATE_ID,
      phone_number: normalizedPhone,
      language: "en_GB",
    });

    // ✅ Pass variable correctly
    payload.append("templateVariable-user-1", patientName);

    console.log("📦 Payload:", payload.toString());

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log(`✅ WhatsApp message sent to ${patientName}`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "❌ Failed to send WhatsApp message:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};
