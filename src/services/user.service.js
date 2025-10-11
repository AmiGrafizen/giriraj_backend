
import {User} from '../models/user.model.js'
import {ApiError} from '../utils/ApiError.js';
import httpStatus from "http-status"
import Product from "../models/product.model.js"
import WishList from '../models/WhatWeOffer.model.js';
import { Types } from 'mongoose';
import { Review } from '../models/review.model.js';
import Order from '../models/order.model.js';
import orderStatus from '../config/orderStatus.js';
import Category from '../models/category.model.js';
import OrderSummary from '../models/orderSummary.model.js';
import Contact from '../models/contactUs.model.js';
import Warranty from '../models/vision-mission.model.js';
import Coupon from '../models/team.model.js';
import { Blog } from '../models/blog.model.js';
import { AboutUs } from '../models/aboutUs.model.js';

const getUserByEmail = async (email) => {
    return User.findOne({ email });
  };

const getUserByName = async (username) => {
    return User.findOne({ username });
  };

const getUserById = async (id) => {
    return User.findById(id);
  };

const getProductById = async (id) => {
    return Product.findById(id).select("-password");
  };


const createWishlist = async (userId, productIds) => {
  for (let productId of productIds) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid productId: ${productId}`);
    }
  }

  const productObjectIds = productIds.map(id => new Types.ObjectId(id));

  const user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');

  const products = await Promise.all(
    productObjectIds.map(productId => getProductById(productId))
  );
  
  for (let product of products) {
    if (!product) throw new ApiError(httpStatus.BAD_REQUEST, `Product not found`);
  }

  let wishlist = await WishList.findOne({ userId });

  if (!wishlist) {
    wishlist = new WishList({ userId, products: productObjectIds });
  } else {
    for (let productId of productObjectIds) {
      if (!wishlist.products.some(p => p.equals(productId))) {
        wishlist.products.push(productId);
      }
    }
  }

  await wishlist.save();

  return wishlist;
};

const deleteWishlistProduct = async (userId, removeProductIds) => {
  if (!Array.isArray(removeProductIds)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'removeProductIds must be an array');
  }
  removeProductIds.forEach(productId => {
    if (!Types.ObjectId.isValid(productId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid productId: ${productId}`);
    }
  })

  const removeProductObjectIds  = removeProductIds.map(id => new Types.ObjectId(id));

  const user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');

 
  let wishlist = await WishList.findOne({ userId });

  if (!wishlist) {
     throw new ApiError(httpStatus.BAD_REQUEST, `Wishlist not found`);
  } 
  
  wishlist.products = wishlist.products.filter(product => 
    !removeProductObjectIds.some(p => p.equals(product))
  )
  
  await wishlist.save();

  return wishlist;
};

const getWishlist = async (userId) =>{
  const user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');

  let wishlist = await WishList.findOne({ userId })
  // .populate('products','name');
  console.log("wishlist",wishlist)
  if (!wishlist) {
     throw new ApiError(httpStatus.BAD_REQUEST, `Wishlist not found`);
  } 
  return wishlist;
}

const deleteWishlist = async (userId) =>{
  const user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');

  let wishlist = await WishList.findOne({ userId });

  if (!wishlist) {
     throw new ApiError(httpStatus.BAD_REQUEST, `Wishlist not found`);
  }

  await wishlist.deleteOne({userId})

  return wishlist;
}


const getOrderListByUser = async(userId,status) =>{
  console.log("userId,status",userId,status)
  const user = await getUserById(userId);

  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');

  if(!status) throw new ApiError(httpStatus.NOT_FOUND, 'status is required'); 
  console.log("status",status)
  if (status !== "complete" && status !== "incomplete") {
    throw new ApiError(httpStatus.NOT_FOUND, 'Select a valid status');
  }
  const data = await Cart.find({ userId: userId, status: status });

  return data;
}

const createFeedback = async (feedbackData) => {
  if(!feedbackData.name) throw new ApiError(httpStatus.BAD_REQUEST, 'Name is required!');
  if(!feedbackData.description) throw new ApiError(httpStatus.BAD_REQUEST, 'Description is required!')

    return Review.create(feedbackData);
};

const addShippingAddress = async (userId,addressData) => {
  const user =await getUserById(userId)
  if(!user) throw new ApiError(httpStatus.BAD_REQUEST, 'user not found!');
  console.log("addressData",addressData)
  console.log("usersd",user)

  // if(!user.shippingAddress){
  //   user.shippingAddress = [];
  // }
  user.shippingAddress.push(addressData)

  if(user?.shippingAddress.length === 1){
    user.shippingAddress[0].isPrimary = true;
  }

  await user.save()
  return user;
};

const updateShippingAddress= async (userId,addressId,newAddress) => {
  const user = await getUserById(userId)
  if(!user) throw new ApiError(httpStatus.BAD_REQUEST, 'user not found!');

 const addressIndex = user.shippingAddress.findIndex(address =>{
   return  address._id.toString() === addressId;
  })
  console.log("addressIndex",addressIndex,newAddress)
  if(addressIndex !== -1){
    user.shippingAddress[addressIndex] = {...user.shippingAddress[addressIndex],...newAddress}
  }else {
    user.shippingAddress.push(newAddress)
  }
  const address = user.shippingAddress.id(addressId)
  if(address){
    address.isPrimary = true;
  }

  await user.save()
  return user;
};
const deleteShippingAddress = async (userId, addressId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
  }
  
  const addressIndex = user.shippingAddress.findIndex(
    (address) => address._id.toString() === addressId
  );

  if (addressIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found!');
  }
  console.log("after",user?.shippingAddress)

  user.shippingAddress.splice(addressIndex, 1);

  // console.log(
  //   "Updated Shipping Addresses:",
  //   user.shippingAddress.map((address) => address.toObject())
  // );
  // console.log("befor",user?.shippingAddress)
  // if (user.shippingAddress.length > 0) {
  //   const hasPrimary = user.shippingAddress.some((address) => address.isPrimary);
  //   if (!hasPrimary) {
  //     user.shippingAddress[0].isPrimary = true;
  //   }
  // }

  await user.save();

  return user;
};


const updatePrimaryAddress = async (userId,addressId) => {
  const user =await getUserById(userId)
  if(!user) throw new ApiError(httpStatus.BAD_REQUEST, 'user not found!');

  user.shippingAddress.forEach(address =>{
    address.isPrimary = false;
  })

  const address = user.shippingAddress.find(address => {
    return address._id.toString() === addressId;
  });

  if (!address) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Address not found!');
  }
  if(address){
    address.isPrimary = true;
  }
  
  await user.save()
  return user;
};

const getUserAddressById = async (userId) => {
  const user = await getUserById(userId)
  return user;
};

const getFeedbacks = async () => {
  return Review.find();
};

const updateFeedback = async (id, feedbackData) => {
  const updateData = await Review.findByIdAndUpdate(id, feedbackData, {new: true});
  if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
  return updateData;
};

const deleteFeedback = async (id) => {
  const deleteId =  await Review.findByIdAndDelete(id);
  if (deleteId === null ) throw ApiError(httpStatus.NOT_FOUND, 'Data not found');
  return deleteId;
};
const getProducts = async (query) => {
  // const { page = 1, limit = 10, sortBy, filter = {} } = query;
  
  // const pageNumber = parseInt(page, 10);
  // const limitNumber = parseInt(limit, 10);

  // const options = {
  //   page: pageNumber,
  //   limit: limitNumber,
  // }
  // const result = await Product.paginate(filter, options);
  //   const products = await Product.find()
  //     .populate('categoryId', 'name')
  //     .populate('subCategoryId', 'name')
  //     .populate('collections', 'name')
  //     .populate('labelId', 'name')
  //     .populate('attributes', 'name value');
  
  //   const currentDate = new Date();
  
  //   return products.map(product => {
  //     if (product.priceSale && product.priceSale.startDate && product.priceSale.endDate) {
  //       const saleStart = new Date(product.priceSale.startDate);
  //       const saleEnd = new Date(product.priceSale.endDate);
  
  //       if (currentDate >= saleStart && currentDate <= saleEnd) {
  //         product.salePriceApplied = true;
  
  //         if (product.priceSale.salePrice) {
  //           if (typeof product.priceSale.salePrice === 'string' && product.priceSale.salePrice.includes('%')) {
  //             const discountPercentage = parseFloat(product.priceSale.salePrice.replace('%', ''));
  //             console.log("comessfddffdf",discountPercentage)

  //             product.price = product.price - (product.price * discountPercentage / 100);
  //           } else if (typeof product.priceSale.salePrice === 'number') {
  //             product.price = product.price - product.priceSale.salePrice;
  //           }
  //         }
  //       } else {
  //         product.salePriceApplied = false;
  //         product.price = product.price;
  //       }
  //     } else {
  //       product.salePriceApplied = false;
  //     }
  
  //     return product;
  //   });
  const { page = 1, limit = 10, sortBy, filter = {} } = query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const options = {
    page: pageNumber,
    limit: limitNumber,
    sortBy,  
  };

  const result = await Product.paginate(filter, options);

  const currentDate = new Date();
  const products = result.results.map(product => {
    if (product.priceSale && product.priceSale.startDate && product.priceSale.endDate) {
      const saleStart = new Date(product.priceSale.startDate);
      const saleEnd = new Date(product.priceSale.endDate);

      if (currentDate >= saleStart && currentDate <= saleEnd) {
        product.salePriceApplied = true;

        if (product.priceSale.salePrice) {
          if (typeof product.priceSale.salePrice === 'string' && product.priceSale.salePrice.includes('%')) {
            const discountPercentage = parseFloat(product.priceSale.salePrice.replace('%', ''));
            product.price = product.price - (product.price * discountPercentage / 100);
          } else if (typeof product.priceSale.salePrice === 'number') {
            product.price = product.price - product.priceSale.salePrice;
          }
        }
      } else {
        product.salePriceApplied = false;
        product.price = product.price;
      }
    } else {
      product.salePriceApplied = false;
    }

    return product;
  });
  return {
    products,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.totalResults,

  }
  };
const getProductsById = async (id) => {
     return  Product.findById(id);
   };

   const getCategories = async () => {
    return  Category.find();
  };

  export const createOrderSummary = async (orderData) => {
    try {
      const { userId, customerDetails } = orderData;
  
      const userCart = await Cart.findOne({ userId }).populate('items.productId');
  
      if (!userCart || userCart.items.length === 0) {
        throw new Error('Cart is empty. Cannot create order.');
      }
  
      const orderItems = userCart.items.map((cartItem) => ({
        productId: cartItem.productId._id,
        quantity: cartItem.quantity,
        price: cartItem.productId.price,
      }));

      for (const item of orderItems) {
        const product = await Product.findById(item.productId);
  
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
  
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}`
          );
        }
          product.stock -= item.quantity;
        await product.save();
      }

      // Calculate total price
      const totalPrice = orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
  
      // Create the order summary
      const newOrder = new OrderSummary({
        userId,
        customerDetails,
        orderItems,
        totalPrice,
      });
  
      await newOrder.save();
  
      // Clear the user's cart after order creation
      await Cart.findOneAndUpdate({ userId }, { items: [] });
  
      return newOrder;
    } catch (error) {
      throw new Error(`Error creating order summary: ${error.message}`);
    }
  };

const getOrderSummaryById = async (orderId) => {
    try {
      const order = await OrderSummary.findById(orderId).populate({
        path: 'orderItems.productId',
        select: '_id name price description stock image', 
      });
  
      if (!order) {
        throw new Error('Order not found');
      }
  
      return order;
    } catch (error) {
      throw new Error(`Error fetching order summary: ${error.message}`);
    }
  };
  
 
const getOrdersByUser = async (userId) => {
    try {
      const orders = await OrderSummary.find({ userId }).populate({
        path: 'orderItems.productId',
        select: '_id title subTitle color price description productImgUrl', 
      });
  
      if (orders.length === 0) {
        throw new Error('No orders found for the user');
      }
  
      return orders;
    } catch (error) {
      throw new Error(`Error fetching user orders: ${error.message}`);
    }
  };

const getAllOrders = async () => {
    try {
      const orders = await OrderSummary.find().populate({
        path: 'orderItems.productId',
        select: '_id name price description image', 
      });
  
      if (orders.length === 0) {
        throw new Error('No orders found');
      }
  
      return orders;
    } catch (error) {
      throw new Error(`Error fetching all orders: ${error.message}`);
    }
  };
  


const updateOrderSummaryById = async (id, updateData) => {
  const order = await OrderSummary.findByIdAndUpdate(id, updateData, { new: true });
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};


const deleteOrderSummaryById = async (id) => {
  const order = await OrderSummary.findByIdAndDelete(id);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

const getOrdersByUserId = async (userId) => {
  try {
    const orders = await OrderSummary.find({ userId }).sort({ date: -1 }); 
    return orders;
  } catch (error) {
    throw new Error("Error fetching order s from the database");
  }
};


const saveContact = async (contactData) => {
  const contact = new Contact(contactData);
  return await contact.save();
};

const getAllContacts = async () => {
  return await Contact.find().sort({ createdAt: -1 });
};

const getContactById = async (id) => {
  return await Contact.findById(id);
};

export const createWarranty = async (data, req, res) => {
  const { productName, productColor, warrantyNumber } = data;

  const product = await Product.findOne({ productName: req?.body.productName, productColor: req?.body.productColor });
if (!product) {
  return res.status(404).send("No product found with the specified name and color");
}


  const existingWarranty = await Warranty.findOne({ warrantyNumber });
  if (existingWarranty) {
    throw new Error("This warranty number is already assigned to another product");
  }

  const warranty = new Warranty({
    productId: product._id,
    warrantyNumber,
  });
  return await warranty.save();
};

const getAllWarranties = async () => {
  return await Warranty.find().populate('productId').sort({ createdAt: -1 });
};

const getWarrantyById = async (id) => {
  return await Warranty.findById(id).populate('productId');
};
const getCoupon = async () => {
  return Coupon.find();
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found!');

  return coupon;
};

const getBlog = async() => {
  return Blog.find();
};

const getAboutUsPage = async() => {
  return AboutUs.find();
};

const getAboutUsById = async(id) => {
  return AboutUs.findById(id);
};

export default {getUserByName,updatePrimaryAddress,updateShippingAddress,addShippingAddress,getUserByEmail,getUserById,
  createWishlist,deleteWishlistProduct,deleteWishlist,getWishlist,getOrderListByUser,createFeedback, getFeedbacks, updateFeedback, deleteFeedback,getUserAddressById,deleteShippingAddress,
  getProducts, getProductsById, getCategories, createOrderSummary, getOrderSummaryById, updateOrderSummaryById, deleteOrderSummaryById,
  getOrdersByUserId, getAllOrders, getOrdersByUser, saveContact, getAllContacts, getContactById, createWarranty, getWarrantyById, getAllWarranties, getCoupon, getCouponById, getBlog, getAboutUsPage, getAboutUsById};
