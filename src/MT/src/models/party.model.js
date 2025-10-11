import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  billingAddress: { type: String },
  shippingAddress: { type: String },
});

const partySchema = new mongoose.Schema(
  {
    partyName: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
    address: addressSchema,
    creditLimit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    additionalFields: { type: Map, of: String },
  },
  { timestamps: true }
);

export default mongoose.model('MTParty', partySchema);
