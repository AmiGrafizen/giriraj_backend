import Joi from "joi";
import mongoose from "mongoose";

const ObjectId = Joi.custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// const createCartSchema = Joi.object({
//     userId: ObjectId.required(),
//     items: Joi.array().items(
//       Joi.object({
//         productId: ObjectId.required(),
//         quantity: Joi.number().min(1).required(),
//         price: Joi.number().min(0).required(),
//       })
//     ).min(1).required(),
//   });
  
  const updateCartItemsSchema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: ObjectId.required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    ).min(1).required(),
  });
  
  const deleteCartItemsSchema = Joi.object({
    productId: ObjectId.required(),
  });
  const validateOrderRequest = Joi.object({
    userId: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('Invalid userId format');
      }
      return value;
    }).optional(),
  
    status: Joi.string().valid('complete', 'incomplete').optional()
  });
export default {updateCartItemsSchema,deleteCartItemsSchema,validateOrderRequest}