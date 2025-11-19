/* eslint-disable no-unused-vars */
import userService from './user.service.js';
import {ApiError} from '../utils/ApiError.js';
import httpStatus from "http-status"
import tokenService from './token.service.js';
import jwt from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';
import { girirajModels } from '../db/index.js';
import { ensureCometUser, generateCometAuthToken } from './cometChat.service.js';

const otpStore = {};
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;


// const createNewUser = async ({ name, email, mobileNumber }) => {
//     const isMobileTaken = await girirajModels?.GIRIRAJUser.isMobileNumberTaken(mobileNumber);
//   if (isMobileTaken) {
//     throw new Error("Mobile number already registered.");
//   } 

//   const newUser = new girirajModels?.GIRIRAJUser({ name, email, mobileNumber });
//   await newUser.save();

//   return {
//     message: 'User registered successfully.',
//     user: { id: newUser._id, name, email, mobileNumber },
//   };
// };


const createNewUser = async ({ name, email, mobileNumber, role, password }) => {
  // check if mobile already exists
  const isMobileTaken = await girirajModels?.GIRIRAJUser?.isMobileNumberTaken(mobileNumber);
  if (isMobileTaken) {
    throw new Error("Mobile number already registered.");
  }

  // create user with password
  const newUser = new girirajModels.GIRIRAJUser({
    name,
    email,
    mobileNumber,
    role,
    password, // ✅ include password
  });

  await newUser.save();

  return {
    message: "User registered successfully.",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      role: newUser.role,
    },
  };
};



 const findUserByMobileNumber = async (mobileNumber) => {
  return await girirajModels?.GIRIRAJUser.findOne({ mobileNumber }); 
};

const createAdmin = async (userBody) => {
  if (!userBody?.email) throw new ApiError(httpStatus.BAD_REQUEST, 'email is required!');
  if (!userBody?.password) throw new ApiError(httpStatus.BAD_REQUEST, 'password is required!');
  const normalizedEmail = userBody.email.toLowerCase();
  const emailExist = await girirajModels?.GIRIRAJUser.findOne({email:normalizedEmail})
  if (emailExist) throw new ApiError(httpStatus.BAD_REQUEST, 'email already exist');
   return girirajModels?.GIRIRAJUser.create(userBody);
 };

 const updateUser = async (userId, user) => {
  if (!userId) throw new ApiError(httpStatus.BAD_REQUEST, "girirajModels?.GIRIRAJUser ID is required!");

  const userNotExist = await userService.getUserById(userId); // Ensure this is awaited
  if (!userNotExist) throw new ApiError(httpStatus.NOT_FOUND, "girirajModels?.GIRIRAJUser not found");

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

  console.log("Filtered girirajModels?.GIRIRAJUser for Update:", user);
  const updatedUser = await girirajModels?.GIRIRAJUser.findByIdAndUpdate(userId, user, { new: true });
  return {
    message: "girirajModels?.GIRIRAJUser updated successfully",
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

    const user = await girirajModels?.GIRIRAJUser.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
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

const loginAdmin = async (email, password) => {
  if (!email) throw new ApiError(httpStatus.BAD_REQUEST, "email is required!");
  if (!password) throw new ApiError(httpStatus.BAD_REQUEST, "password is required!");

  // ✅ Fetch user with password
  const user = await girirajModels?.GIRIRAJUser?.findOne({ email }).select("+password");
  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");

  // ✅ Compare password safely
  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");

  // ✅ Generate tokens
  const tokens = await tokenService.generateAuthTokens(user);

  // --------------------------------------------------------------------
  // 🧠 COMETCHAT INTEGRATION (Auto create + token generation)
  // --------------------------------------------------------------------
  try {
    const uid = `user_${user._id}`; 
    const name = user.name || user.email;

    await ensureCometUser(uid, name, user.avatar || "");

    // ✅ Generate CometChat auth token for frontend login
    const cometToken = await generateCometAuthToken(uid);
    console.log('cometToken', cometToken)

    // ✅ Return full response including cometToken
    return {
      success: true,
      user,
      tokens,
      cometToken, 
      message: "Logged in successfully!",
    };
  } catch (error) {
    console.error("CometChat integration failed:", error.message);

    // Still return normal login response if CometChat fails
    return {
      success: true,
      user,
      tokens,
      message: "Logged in successfully (without chat access due to error)",
    };
  }
};



  const getReferralPrice = async (userId) => {
    const user = await girirajModels?.GIRIRAJUser.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'girirajModels?.GIRIRAJUser not found');
    }
    return user.referPrice;
  };

  const updateReferPrice = async (userId, amount) => {
    const user = await girirajModels?.GIRIRAJUser.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'girirajModels?.GIRIRAJUser not found');
    }
  
    user.referPrice = amount;
    await user.save();
  
    return user.referPrice;
  };

  
  const sendOtp = async (mobileNumber) => {
    if (!mobileNumber) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Mobile number is required!");
    }
  
    const defaultOtp = "12345"; 
    const isDefaultOtpEnabled = true;
    const otp = isDefaultOtpEnabled
      ? defaultOtp
      : Math.floor(10000 + Math.random() * 90000).toString(); 
  
    const otpExpiry = Date.now() + 5 * 60 * 1000; 
  
    // Store OTP in memory
    otpStore[mobileNumber] = {
      otp,
      expiresAt: otpExpiry,
    };
  
    console.log("OTP Store After Generation:", otpStore);
  
    let user = await girirajModels?.GIRIRAJUser.findOne({ mobileNumber });
    if (!user) {
      user = new girirajModels.GIRIRAJUser({ mobileNumber, verified: false });
      await user.save();
    }
  
    console.log(`Generated OTP for ${mobileNumber}: ${otp}`);
    return { message: "OTP sent successfully.", otp };
  };
  
  

  const verifyOtp = async ({ mobileNumber, otp }) => {
    console.log("Mobile Number in verifyOtp:", mobileNumber);
    console.log("Provided OTP:", otp);
  
    if (!mobileNumber || !otp) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Mobile number and OTP are required!");
    }
  
    const storedOtpData = otpStore[mobileNumber];
    console.log("Stored OTP Data:", storedOtpData);
  
    if (!storedOtpData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "OTP not sent or expired.");
    }
  
    if (otp !== storedOtpData.otp) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP.");
    }
  
    if (Date.now() > storedOtpData.expiresAt) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Expired OTP.");
    }
  
    delete otpStore[mobileNumber];
  
    return {
      message: "OTP verified successfully.",
      mobileNumber, 
    };
  };

  const setPassword = async ({ mobileNumber, password, confirmPassword }) => {
    console.log("Mobile Number in setPassword:", mobileNumber);
  
    if (!mobileNumber || !password || !confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Mobile number, password, and confirm password are required!");
    }
  
    if (password !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match!");
    }
  
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await girirajModels?.GIRIRAJUser.findOneAndUpdate(
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
    return girirajModels?.GIRIRAJUser.find(); 
  };
  
  const findUserByNameService = async (name) => {
    try {
      const user = await girirajModels?.GIRIRAJRoleUser.findOne({ name })
        .populate("roleId")
        .select("+password") 
      
      return user;
    } catch (error) {
      console.error("Error finding user by name:", error);
      throw new Error("Failed to fetch user.");
    }
  };

  const findUserByIdentifierService = async (identifier) => {
  try {
    const user = await girirajModels?.GIRIRAJRoleUser.findOne({
      $or: [
        { name: { $regex: `^${identifier}$`, $options: "i" } },  // username (case insensitive)
        { email: { $regex: `^${identifier}$`, $options: "i" } }, // email (case insensitive)
      ],
    })
      .populate("roleId")
      .select("+password");

    return user;
  } catch (error) {
    console.error("Error finding user by identifier:", error);
    throw new Error("Failed to fetch user.");
  }
};



async function validatePasswordService(enteredPassword, userDoc, models) {
  const stored = userDoc?.password || "";
  if (!enteredPassword || !stored) return false;

  // Normal case: already bcrypt
  if (BCRYPT_HASH_RE.test(stored)) {
    return bcrypt.compare(enteredPassword, stored);
  }

  // Legacy case: stored is PLAINTEXT
  if (enteredPassword === stored) {
    // hash and migrate in-place
    const newHash = await bcrypt.hash(enteredPassword, 10);
    await models.GIRIRAJRoleUser.updateOne(
      { _id: userDoc._id },
      { $set: { password: newHash } }
    );
    return true;
  }

  return false;
}

function generateTokenService(user) {
  return jwt.sign(
    { userId: user._id, role: user.roleId?.roleName || "user" },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
}
  

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
  sendOtp,
  verifyOtp,
  findUserByMobileNumber,
  getAllUsers,
  setPassword,
  findUserByNameService,
  validatePasswordService,
  generateTokenService,
  findUserByIdentifierService,
};