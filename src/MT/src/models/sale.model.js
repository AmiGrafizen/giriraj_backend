import mongoose from "mongoose";
import Counter from "./counter.model.js";

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  serialNo: { type: String },
  modelNo: { type: String },
  qty: { type: Number, required: true, default: 1 },
  unit: { type: String, default: "NONE" },
  pricePerUnit: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["Cash", "Bank", "UPI", "Online", "Credit"],
    required: true,
  },
  amount: { type: Number, required: true, default: 0 },
});

const saleSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MTParty",
      required: true,
    },
    billNumber: { type: String },
    billDate: { type: Date, required: true },
    time: { type: String },
    payments: [paymentSchema],
    paymentType: { type: String, default: "Cash" },
    items: [itemSchema],
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    unpaidAmount: { type: Number, default: 0 },
    uploadedBill: { type: String },
  },
  { timestamps: true }
);

// ✅ Auto-calculate paid/unpaid before saving
saleSchema.pre("save", function (next) {
  if (this.payments?.length > 0) {
    this.paidAmount = this.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  if (!this.paidAmount && this.paymentType?.toLowerCase() === "cash") {
    this.paidAmount = this.totalAmount;
  }

  this.unpaidAmount = Math.max(this.totalAmount - this.paidAmount, 0);
  next();
});

// ✅ Auto-increment bill number using Counter collection
saleSchema.pre("save", async function (next) {
  if (this.billNumber) return next(); // Skip if already exists

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "saleBill" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newNumber = counter.seq;
    this.billNumber = `BILL-${newNumber.toString().padStart(6, "0")}`; // BILL-000001 format
    next();
  } catch (err) {
    console.error("❌ Error generating bill number:", err);
    next(err);
  }
});

export default mongoose.model("MTSale", saleSchema);
