import { Schema, model } from 'mongoose';

const shippingStatusSchema = new Schema({
  status: { type: String, required: true, unique: true },
});

const ShippingStatus = model('ShippingStatus', shippingStatusSchema);

export default ShippingStatus;
