import mongoose from "mongoose";

const webUserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    userId: { type: String, unique: true }, // Auto-generated

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    }
  },
  { timestamps: true }
);

export default webUserSchema;
