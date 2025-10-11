import Joi from "joi";

const userRegistrationSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format!',
      'any.required': 'Email is required!'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long!',
      'any.required': 'Password is required!'
    }),
    username: Joi.string().optional(),
    shippingAddress: Joi.array().items(
      Joi.object({
        street: Joi.string().required().messages({
          'string.required': 'Street is required!',
        }),
        city: Joi.string().required().messages({
          'string.required': 'City is required!',
        }),
        state: Joi.string().required().messages({
          'string.required': 'State is required!',
        }),
        zipCode: Joi.string().required().messages({
          'string.required': 'Zip code is required!',
        }),
        country: Joi.string().required().messages({
          'string.required': 'Country is required!',
        }),
        isPrimary: Joi.boolean().optional(),
      })
    ).optional().messages({
      'array.base': 'Shipping address must be an array of address objects!',
    }),
  });

  const updateUserSchema = Joi.object({
    email: Joi.string().email().optional().messages({
      'string.email': 'Invalid email format!',
    }),
    username: Joi.string().optional().messages({
      'string.base': 'Username must be a string!',
    }),
  });
  
  export default {userRegistrationSchema,updateUserSchema}