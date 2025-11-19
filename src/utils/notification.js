import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });


export const sendBookingEmail = async (to, subject, htmlBody) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,    
    auth: {
      user: "amidesai504@gmail.com",
      pass: "kbcehsprwhgzrzpd",
    },
  });

  await transporter.sendMail({
    from: `"CDH Booking" <amidesai504@gmail.com>`,
    to,
    subject,
    html: htmlBody,
  });
};

export const sendBookingWhatsApp = async (mobileNumber, message) => {
  const payload = {
    phone: mobileNumber,
    token: "YOUR_CHATBOX_TOKEN",
    template_id: "YOUR_TEMPLATE_ID",
    variables: [message],
  };

  await axios.post("https://chattrbox.io/api/sendTemplateMessage", payload, {
    headers: {
      Authorization: `Bearer YOUR_AUTH_TOKEN`,
      "Content-Type": "application/json",
    },
  });
};
