import mongoose from 'mongoose';


const salePartySchema = new mongoose.Schema(
  {
    partyName: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
    billingAddress: { type: String },
    creditLimit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    additionalFields: { type: Map, of: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default salePartySchema;
