import jwt from 'jsonwebtoken';
import moment from 'moment';
// import { NOT_FOUND } from 'http-status';
// import { jwt as _jwt } from '../config/config';``
// import { getUserByEmail } from './user.service';
// import ApiError from '../utils/ApiError';
import  tokenTypes  from '../config/tokens.js';
import { girirajModels } from '../db/index.js';
import dotenv from "dotenv";
import path from "path";

const { sign, verify } = jwt;

dotenv.config({ path: path.resolve(process.cwd(), "config.env") });

const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

function getModel(modelName) {
  if (!girirajModels || typeof girirajModels !== "object") {
    console.error("❌ girirajModels not initialized or invalid");
    return null;
  }

  const allKeys = Object.keys(girirajModels);
  if (!allKeys.length) {
    console.error("⚠️ No models loaded in girirajModels");
    return null;
  }

  // 🧠 Try to find by case-insensitive or partial match
  const lowerTarget = modelName.toLowerCase();
  const foundKey = allKeys.find(
    (k) => k.toLowerCase() === lowerTarget || k.toLowerCase().includes(lowerTarget)
  );

  if (!foundKey) {
    console.warn(`⚠️ Model "${modelName}" not found. Available models:`, allKeys);
    return null;
  }

  let model = girirajModels[foundKey];

  // 🧩 If wrapped { primary, secondary }, unwrap safely
  if (model && typeof model.find !== "function") {
    model = model.primary || model.secondary || model.default || model.model;
  }

  if (!model || typeof model.find !== "function") {
    console.error(`❌ "${foundKey}" is not a valid Mongoose model.`, model);
    return null;
  }

  console.log(`✅ Using model: ${foundKey}`);
  return model;
}

/**
 * Generate token
 * @param {User} user
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (user, expires, type, secret = process.env.ACCESS_TOKEN_SECRET) => {
  const payload = {
    sub: user.id,
    username: user.username || '',
    email: user.email || '',
    role: user.role,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<GIRIRAJToken>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await girirajModels.GIRIRAJToken?.create({
    token,
    userId,       // must match schema field
    expiry: expires.toDate(),  // must be a Date, not a Moment object
    type,
    blacklisted,
  });
  return tokenDoc;
};
/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<GIRIRAJToken>}
 */
const verifyToken = async (token, type) => {
  const payload = verify(token, tokenSecret);
  const tokenModel = getModel("GIRIRAJToken");
  const tokenDoc = await tokenModel()?.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('GIRIRAJToken not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */

const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(1, "hours");
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(7, "days");
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  // ✅ Save refresh token in DB with correct mapping
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};


/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
// const generateResetPasswordToken = async (email) => {
//   const user = await getUserByEmail(email);
//   if (!user) {
//     throw new ApiError(NOT_FOUND, 'No users found with this email');
//   }
//   const expires = moment().add(_jwt.resetPasswordExpirationMinutes, 'minutes');
//   const resetPasswordToken = generateToken(user, expires, tokenTypes.RESET_PASSWORD);
//   await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
//   return resetPasswordToken;
// };

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
// const generateVerifyEmailToken = async (user) => {
//   const expires = moment().add(_jwt.verifyEmailExpirationMinutes, 'minutes');
//   const verifyEmailToken = generateToken(user, expires, tokenTypes.VERIFY_EMAIL);
//   await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
//   return verifyEmailToken;
// };


const saveUserToken = async (userId, token) => {
  if (!userId || !token) {
    throw new Error("UserId and token are required");
  }

  const userModel = getModel("GIRIRAJUser")
  const user = await userModel.findByIdAndUpdate(
    userId,
    { $addToSet: { fcmTokens: token } }, // $addToSet prevents duplicates
    { new: true }
  );  

  return user;
};

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  saveUserToken,
  // generateResetPasswordToken,
  // generateVerifyEmailToken,
};
