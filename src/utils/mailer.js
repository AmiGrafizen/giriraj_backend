import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (not your account password)
  },
});

export const sendOtpMail = async (email, otp) => {
  const mailOptions = {
    from: `"HYGO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Login',
    html: `
      <h2>Login OTP</h2>
      <p>Your OTP is <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
