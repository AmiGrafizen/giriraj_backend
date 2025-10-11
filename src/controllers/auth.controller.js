import { User } from "../models/user.model.js";
import authService from "../services/auth.service.js";
import tokenService from "../services/token.service.js";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import httpStatus from "http-status" ;

const registerUser = catchAsync(async (req, res) => {
  const user = await authService.createNewUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const registerAdmin = catchAsync(async (req, res) => {
  const user = await authService.createAdmin(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await authService.updateUser(req.params?.userId,req.body);
  res.status(httpStatus.OK).send({ user });
});

const loginUser = catchAsync(async (req, res) => {
  const {email,password} = req.body
  const user = await authService.loginUser(email,password);
  res.status(httpStatus.OK).send({ user });
});

const loginAdmin = catchAsync(async (req, res) => {
  const {email,password} = req.body
  const user = await authService.loginAdmin(email,password);
  res.status(httpStatus.OK).send({ user });
});

const getReferPrice = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const referPrice = await authService.getReferralPrice(userId); 
    res.status(httpStatus.OK).send({ success: true, referPrice });
  } catch (error) {
    next(error);
  }
};

const updateReferPrice = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const updatedReferPrice = await authService.updateReferPrice(userId, amount);

    res.status(httpStatus.OK).json({
      success: true,
      referPrice: updatedReferPrice,
    });
  } catch (error) {
    next(error);
  }
};
const getAllUsers = async (req, res, next) => {
  const users = await authService.getAllUsers(req.body);
  res.status(httpStatus.OK).send({ users });
};

 


const sendOtp = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number.",
      });
    }

    const existingUser = await authService.findUserByMobileNumber(mobileNumber);

    if (!existingUser) {
      const newUser = await authService.createNewUser({ mobileNumber });

      if (!newUser) {
        return res.status(500).json({
          success: false,
          message: "Failed to create a new user.",
        });
      }
    }

    const response = await authService.sendOtp(mobileNumber);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || mobileNumber.length !== 10 || !otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Mobile number and OTP are required.",
      });
    }

    const response = await authService.verifyOtp(mobileNumber, otp);
    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const updatedOrder = await authService.updatePaymentStatusService(orderId, paymentStatus);

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal server error.',
    });
  }
};

  
export default {registerUser,registerAdmin,loginUser,loginAdmin,updateUser, getReferPrice, updateReferPrice, sendOtp, verifyOtp, updatePaymentStatus, getAllUsers}