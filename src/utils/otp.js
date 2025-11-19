import crypto from 'crypto';

/**
 * Generate a 6-digit numeric OTP
 * @returns {string} OTP string
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash the OTP using SHA-256 for security
 * @param {string} otp - The OTP to hash
 * @returns {string} Hashed OTP
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Compare plain OTP with stored hash
 * @param {string} otp - User entered OTP
 * @param {string} hash - Stored hashed OTP
 * @returns {boolean} Whether OTP matches
 */
export const compareOTP = (otp, hash) => {
  return hashOTP(otp) === hash;
};
