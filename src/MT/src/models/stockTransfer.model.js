import mongoose from "mongoose";

const transferItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  serialNo: { type: String },
  model: { type: String },
  qty: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
});

const transferSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MTInfo", // Your firm/company model
      required: true,
    },
    fromBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MTBranch",
      required: true,
    },
    toBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MTBranch",
      required: true,
    },
    transferDate: { type: Date, default: Date.now },
    items: [transferItemSchema],
    totalQty: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    note: { type: String },
  },
  { timestamps: true }
);

// auto-calc totals
transferSchema.pre("save", function (next) {
  this.totalQty = this.items.reduce((sum, i) => sum + (i.qty || 0), 0);
  this.totalAmount = this.items.reduce((sum, i) => sum + (i.amount || 0), 0);
  next();
});

export default transferSchema;
