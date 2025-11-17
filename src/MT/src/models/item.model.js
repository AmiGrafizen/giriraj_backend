import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    itemCode: { type: String, unique: true, sparse: true },
    unit: { type: String, default: "NONE" },
    isService: { type: Boolean, default: false }, // true for service, false for product
    itemImage: { type: String }, // optional image URL or path

    // Tracking options
    batchTracking: { type: Boolean, default: false },
    serialTracking: { type: Boolean, default: false },

    // Pricing
    salePrice: { type: Number, default: 0 },
    wholesalePrice: { type: Number, default: 0 },

    // Stock information
    openingStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    maxStock: { type: Number, default: 0 },

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

// Auto-generate item code if not provided
itemSchema.pre("save", async function (next) {
  if (!this.itemCode) {
    const lastItem = await mongoose.model("MTItem").findOne().sort({ createdAt: -1 });
    let nextCode = 1;
    if (lastItem?.itemCode) {
      const match = lastItem.itemCode.match(/ITM-(\d+)/);
      if (match) nextCode = parseInt(match[1]) + 1;
    }
    this.itemCode = `ITM-${nextCode.toString().padStart(4, "0")}`;
  }
  next();
});

export default itemSchema;
