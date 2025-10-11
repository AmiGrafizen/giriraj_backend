/* eslint-disable no-unused-vars */
import userService from './user.service.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import tokenTypes from '../config/tokens.js';
import httpStatus from "http-status"
import tokenService from './token.service.js';
import jwt from 'jsonwebtoken';

const createNewUser = async (userBody = {}) => {
  const generateReferralCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let referralCode = "";
    for (let i = 0; i < 6; i++) {
      referralCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return referralCode;
  };

  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = generateReferralCode();
    const existingCode = await User.findOne({ referralCode });
    if (!existingCode) {
      isUnique = true;
    }
  }

  if (userBody.referredBy) {
    const referrer = await User.findOne({ referralCode: userBody.referredBy });
    if (!referrer)
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid referral code");
    referrer.referPrice = (referrer.referPrice || 0) + 10; 
    await referrer.save();
  }

  const defaultUser = {
    email: userBody.email || null,
    password: userBody.password || null, 
    shippingAddress: userBody.shippingAddress || [],
    referralCode,
    referPrice: 0, 
    createdAt: new Date(), 
    ...userBody, 
  };

  if (defaultUser.shippingAddress.length > 0) {
    defaultUser.shippingAddress = defaultUser.shippingAddress.map((address, index) => ({
      street: address.street || null,
      city: address.city || null,
      state: address.state || null,
      zipCode: address.zipCode || null,
      country: address.country || null,
      isPrimary: index === 0, 
    }));
  }

  return User.create(defaultUser);
};


 const findUserByMobileNumber = async (mobileNumber) => {
  return await User.findOne({ mobileNumber }); 
};

const createAdmin = async (userBody) => {
  if (!userBody?.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required!');
  }
  if (!userBody?.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required!');
  }

  const normalizedEmail = userBody.email.toLowerCase();

  // Check if email already exists
  const emailExist = await User.findOne({ email: normalizedEmail });
  if (emailExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }

  // Only allow email and password fields
  const newUser = {
    email: normalizedEmail,
    password: userBody.password,
  };

  // Create and return the new user
  return User.create(newUser);
};


 const updateUser = async (userId, user) => {
  if (!userId) throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required!");

  const userNotExist = await userService.getUserById(userId); // Ensure this is awaited
  if (!userNotExist) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (user?.email) {
    const emailExist = await userService.getUserByEmail(user?.email);
    if (emailExist) throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  if (user?.password) delete user?.password;

  const allowedUpdates = ["name", "email", "mobileNumber"];
  const updates = Object.keys(user);

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid update fields!");
  }

  console.log("Filtered User for Update:", user);
  const updatedUser = await User.findByIdAndUpdate(userId, user, { new: true });
  return updatedUser;
};


const loginUser  = async(email,password) => {
    if (!email) throw new ApiError(httpStatus.BAD_REQUEST, 'email is required!');
    if (!password) throw new ApiError(httpStatus.BAD_REQUEST, 'password is required!');
    const user = await userService.getUserByEmail(email);
  
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    const tokens = await tokenService.generateAuthTokens(user);
    return { success: true, user, tokens, message: 'Logged in successfully!' };
  }


  const loginAdmin  = async(email,password) => {
    console.log(`email is ${email} password ${password}`)
    if (!email) throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required!');
    if (!password) throw new ApiError(httpStatus.BAD_REQUEST, 'password is required!');
    const user = await User.findOne({ email });

      if (user && user.role !== 'admin') {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access!');
        }
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    const tokens = await tokenService.generateAuthTokens(user);
    return { success: true, user, tokens, message: 'Logged in successfully!' };
  }


  const getReferralPrice = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
    return user.referPrice;
  };

  const updateReferPrice = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  
    user.referPrice = amount;
    await user.save();
  
    return user.referPrice;
  };

  const otpStore = {};

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000); 

  const sendOtp = async (mobileNumber) => {
    const otp = generateOtp();

    otpStore[mobileNumber] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
  
    console.log(`OTP for ${mobileNumber}: ${otp}`); 
  
    return {
      message: "OTP sent successfully",
      mobileNumber,
    };
  };

  const verifyOtp = async (mobileNumber, inputOtp) => {
    const hardcodedOtp = "123456"; 
  
    if (inputOtp !== hardcodedOtp) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP.");
    }
  
    let user = await User.findOne({ mobileNumber });
  
    if (!user) {
      user = await User.create({
        mobileNumber,
      });
    }
    const token = jwt.sign(
      { userId: user._id, mobileNumber: user.mobileNumber }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );
  
    return {
      message: "OTP verified successfully",
      userId: user._id,
      token,
    };
  };

  const getAllUsers  = async () => {
    return User.find(); 
  };

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
// const logout = async (refreshToken) => {
//   const refreshTokenDoc = await findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
//   if (!refreshTokenDoc) {
//     throw new ApiError(NOT_FOUND, 'Not found');
//   }
//   await refreshTokenDoc.remove();
// };

export default {
  createNewUser,
  loginUser,
  updateUser,
  loginAdmin,
  createAdmin,
  getReferralPrice,
  updateReferPrice,
  sendOtp,
  verifyOtp,
  findUserByMobileNumber,
  getAllUsers,
};