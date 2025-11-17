import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roleUserSchema = new Schema(
  {
    role: { type: Schema.Types.ObjectId, ref: "MTRole"},
    name: { type: String},
    phoneNo: { type: Number},
  },
  { timestamps: true }
);

export default roleUserSchema;
