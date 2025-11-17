/* eslint-disable no-unused-vars */
import userService from './user.service.js';
import {ApiError} from '../utils/ApiError.js';
import httpStatus from "http-status"
import tokenService from './token.service.js';
import jwt from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';
import { mtModels } from '../db/index.js';

const otpStore = {};

const createNewUser = async ({ name, email, mobileNumber }) => {
  const UserModel = mtModels?.MTUser;
  if (!UserModel) throw new Error("MTUser model not found or not initialized.");

  // ✅ Check if mobile number already exists
  const isMobileTaken = await UserModel.isMobileNumberTaken(mobileNumber);
  if (isMobileTaken) {
    throw new Error("Mobile number already registered.");
  }

  // ✅ Create and save user
  const newUser = new UserModel({ name, email, mobileNumber });
  await newUser.save();

  return {
    message: "User registered successfully.",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
    },
  };
};


const createAdmin = async (userBody) => {
  if (!userBody?.email) throw new ApiError(httpStatus.BAD_REQUEST, 'email is required!');
  if (!userBody?.password) throw new ApiError(httpStatus.BAD_REQUEST, 'password is required!');
  const normalizedEmail = userBody.email.toLowerCase();
  const emailExist = await mtModels?.MTUser.findOne({email:normalizedEmail})
  if (emailExist) throw new ApiError(httpStatus.BAD_REQUEST, 'email already exist');
   return mtModels?.MTUser.create(userBody);
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
  const updatedUser = await mtModels?.MTUser.findByIdAndUpdate(userId, user, { new: true });
  return {
    message: "User updated successfully",
    name: updatedUser?.name,
    user: updatedUser
  };  
};

const loginUser = async (name, password) => {
  try {
    console.log("Received Name:", name);

    if (!name || !password) {
      throw new Error("Name and password are required.");
    }

    const user = await mtModels?.MTUser?.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (!user) {
      throw new Error("User not found.");
    }
    console.log("Fetched User:", user);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Provided Password:", password);
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match Status:", isPasswordValid);
    
  
    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.ACCESS_TOKEN_SECRET,    
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      message: "Login successful.",
      user: userResponse,
      token,
    };
  } catch (error) {
    console.error("Login Error:", error.message);
    throw new Error(error.message);
  }
};

const loginAdmin  = async(username,password) => {
  console.log(`username is ${username} password ${password}`)
  if (!username) throw new ApiError(httpStatus.BAD_REQUEST, 'user Name is required!');
  if (!password) throw new ApiError(httpStatus.BAD_REQUEST, 'password is required!');
  const user = await userService.getUserByName(username);

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
    const user = await mtModels?.MTUser.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
    return user.referPrice;
  };

  const updateReferPrice = async (userId, amount) => {
    const user = await mtModels?.MTUser.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  
    user.referPrice = amount;
    await user.save();
  
    return user.referPrice;
  };

  
  // const sendOtp = async (mobileNumber) => {
  //   if (!mobileNumber) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, "Mobile number is required!");
  //   }
  
  //   const defaultOtp = "12345"; 
  //   const isDefaultOtpEnabled = true;
  //   const otp = isDefaultOtpEnabled
  //     ? defaultOtp
  //     : Math.floor(10000 + Math.random() * 90000).toString(); 
  
  //   const otpExpiry = Date.now() + 5 * 60 * 1000; 
  
  //   // Store OTP in memory
  //   otpStore[mobileNumber] = {
  //     otp,
  //     expiresAt: otpExpiry,
  //   };
  
  //   console.log("OTP Store After Generation:", otpStore);
  
  //   let user = await mtModels?.MTUser.findOne({ mobileNumber });
  //   if (!user) {
  //     user = new mtModels?.MTUser({ mobileNumber, verified: false });
  //     await user.save();
  //   }
  
  //   console.log(`Generated OTP for ${mobileNumber}: ${otp}`);
  //   return { message: "OTP sent successfully.", otp };
  // };
  
  

  // const verifyOtp = async ({ mobileNumber, otp }) => {
  //   console.log("Mobile Number in verifyOtp:", mobileNumber);
  //   console.log("Provided OTP:", otp);
  
  //   if (!mobileNumber || !otp) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, "Mobile number and OTP are required!");
  //   }
  
  //   const storedOtpData = otpStore[mobileNumber];
  //   console.log("Stored OTP Data:", storedOtpData);
  
  //   if (!storedOtpData) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, "OTP not sent or expired.");
  //   }
  
  //   if (otp !== storedOtpData.otp) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP.");
  //   }
  
  //   if (Date.now() > storedOtpData.expiresAt) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, "Expired OTP.");
  //   }
  
  //   delete otpStore[mobileNumber];
  
  //   return {
  //     message: "OTP verified successfully.",
  //     mobileNumber, 
  //   };
  // };

  const setPassword = async ({ mobileNumber, password, confirmPassword }) => {
    console.log("Mobile Number in setPassword:", mobileNumber);
  
    if (!mobileNumber || !password || !confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Mobile number, password, and confirm password are required!");
    }
  
    if (password !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match!");
    }
  
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await User.findOneAndUpdate(
      { mobileNumber },
      { password: hashedPassword, verified: true },
      { new: true }
    );
  
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
    }
  
    const userResponse = user.toObject();
    delete userResponse.password;
  
    return {
      message: "Password set successfully.",
      user: userResponse,
    };
  };

  const getAllUsers  = async () => {
    return mtModels?.MTUser.find(); 
  };

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */

export default {
  createNewUser,
  loginUser,
  updateUser,
  loginAdmin,
  createAdmin,
  getReferralPrice,
  updateReferPrice,
  // sendOtp,
  // verifyOtp,
  // findUserByMobileNumber,
  getAllUsers,
  setPassword,
};