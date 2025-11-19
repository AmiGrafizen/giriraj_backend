import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser", required: true },
    type: { type: String, enum: ["ACCESS", "REFRESH"], required: true },
    expiry: { type: Date, required: true },
    blacklisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("GIRIRAJToken", tokenSchema);
