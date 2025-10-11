import mongoose from "mongoose";

const { Schema, model } = mongoose;

const branchSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MTInfo", // assuming 'Info' is your company model
      required: [true, "Company is required"],
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default model("MTBranch", branchSchema);
