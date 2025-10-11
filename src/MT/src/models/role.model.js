import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roleSchema = new Schema(
  {
    role: { type: String},
    permission:[{ type: String }],
  },
  { timestamps: true }
);

export default model("MTRole", roleSchema);
