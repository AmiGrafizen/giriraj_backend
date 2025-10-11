import { Schema, SchemaTypes, model } from 'mongoose';

const walletAmountSchema = Schema(
  {
    user: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
  },
  {
    timestamps: true,
  },
);
const WalletAmount = model('WalletAmount', walletAmountSchema);

export default WalletAmount;
