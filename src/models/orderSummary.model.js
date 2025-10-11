import mongoose from 'mongoose';

const orderSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    customerDetails: {  
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      companyName: { type: String },
      country: { type: String, required: true },
      streetAddress: { type: String, required: true },
      pinCode: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    orderItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'COD', 'paypal'],
      // required: true,
    },
    paymentStatus: {  
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const OrderSummary = mongoose.model('OrderSummary', orderSummarySchema);

export default OrderSummary;
