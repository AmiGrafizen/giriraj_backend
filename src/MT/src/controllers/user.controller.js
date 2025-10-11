import userService from "../services/user.service.js";
import { sendSuccessResponse } from "../utils/ApiMessage.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";


const addShippingAddress = catchAsync(async (req, res) => {
  const {userId} = req.params
  const addShippingAddress = await userService.addShippingAddress(userId,req.body);
  sendSuccessResponse(res, 'create',  addShippingAddress );
});

const updatePrimaryAddress = catchAsync(async (req, res) => {
  const {userId,addressId} = req.params
  const updateAddress = await userService.updatePrimaryAddress(userId,addressId);
  sendSuccessResponse(res, 'update',  updateAddress );
});

const updateShippingAddress = catchAsync(async (req, res) => {
  const {userId,addressId} = req.params
  const updatePrimaryAddress = await userService.updateShippingAddress(userId,addressId,req.body);
  sendSuccessResponse(res, 'update',  updatePrimaryAddress );
});

const deleteShippingAddress = catchAsync(async (req, res) => {
  const {userId,addressId} = req.params
  const updatePrimaryAddress = await userService.deleteShippingAddress(userId,addressId);
  sendSuccessResponse(res, 'delete',  updatePrimaryAddress );
});


const getUserAddressById = catchAsync(async (req, res) => {
  const userData = await userService.getUserAddressById(req.params.userId);
  sendSuccessResponse(res, 'get',  userData );
});


const orderStatusChange = catchAsync(async (req, res) => {
  const {status} = req.query;
  const order = await userService.orderStatusChange(req.params.userId,req.params.orderId,status);
  sendSuccessResponse(res, 'update',  order );
});

const getOrderReceipt = catchAsync(async (req, res) => {
  const {status} = req.query;
  const order = await userService.getOrderReceipt(req.params.userId,req.params.orderId);
  sendSuccessResponse(res, 'get',  order );
});

const getProducts  = catchAsync(async (req, res) => {
  const product = await userService.getProducts(req.query);
  sendSuccessResponse(res, 'get', product)
});

// const getProductsById = catchAsync(async (req, res) => {
//   const product = await userService.getProductsById(req.params.id);
//   sendSuccessResponse(res, 'get', product)
// });

const getProductsById = catchAsync(async (req, res) => {
  const { productId } = req.params;
  console.log("Product ID received in backend:", productId);
  console.log("Type of Product ID:", typeof productId);


  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid Product ID' });
  }

  const product = await userService.getProductsById(productId);

  if (!product) {
    return res.status(404).json({ status: 'fail', message: 'Product not found' });
  }

  sendSuccessResponse(res, 'get', product);
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await userService.getCategories(req.query);
  sendSuccessResponse(res, 'get', categories);
});


export const getOrderSummaryById = async (req, res) => {
    const orderId = req.params.id;
    const order = await userService.getOrderSummaryById(orderId);
    sendSuccessResponse(res, 'get', order);
};

const updateOrderSummaryByIdHandler = async (req, res) => {
  try {
    const order = await userService.updateOrderSummaryById(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const deleteOrderSummaryByIdHandler = async (req, res) => {
  try {
    const order = await userService.deleteOrderSummaryById(req.params.id);
    res.status(200).json({ success: true, message: 'Order deleted successfully', data: order });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
    const { userId } = req.params;

    const orders = await userService.getOrdersByUser(userId);
    sendSuccessResponse(res, 'get', orders);           
};

const getAllOrders = async (req, res ) => {
  const orders = await userService.getAllOrders();
  sendSuccessResponse(res, 'get', orders);
}

const createWarranty = async (req, res) => {
  try {
    console.log("Request Body:", req.body); 

    const { productName, productColor, warrantyNumber, userId } = req.body;

    if (!productName || !productColor || !warrantyNumber || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const warranty = await userService.createWarranty({
      productName,
      productColor,
      warrantyNumber,
      userId,
    });

    return res.status(201).json({
      message: "Warranty created successfully",
      warranty,
    });
  } catch (error) {
    console.error("Error creating warranty:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


 const getAllWarranties = async (req, res) => {
  try {
    const warranties = await userService.getAllWarranties();
    res.status(200).json({ warranties });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

export const getWarrantiesByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const warranties = await userService.getWarrantiesByUserId(userId);
    res.status(200).json({ success: true, data: warranties });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Unable to fetch warranties." });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);

    if (!user) {
      throw new ApiError("User not found");
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error); 
  }
};

const getCoupon  = catchAsync(async (req, res) => {
  const coupon = await userService.getCoupon(req.body);
sendSuccessResponse(res, 'get', coupon);
});

const getCouponById  = catchAsync(async (req, res) => {
  const coupon = await userService.getCouponById(req.params.id);
sendSuccessResponse(res, 'get', coupon)
});

const getBlog = catchAsync(async (req, res) => {
  const blog = await userService.getBlog(req.body);
sendSuccessResponse(res, 'get', blog)
});


export default {updateShippingAddress,updatePrimaryAddress,addShippingAddress,
  getUserAddressById,deleteShippingAddress,orderStatusChange,getOrderReceipt, getProducts, getProductsById, getCategories,
 getOrderSummaryById, updateOrderSummaryByIdHandler, deleteOrderSummaryByIdHandler, getOrdersByUserId, getAllOrders,
createWarranty, getAllWarranties, getWarrantiesByUserId, getUserById, getCoupon, getCouponById, getBlog, createWarranty}