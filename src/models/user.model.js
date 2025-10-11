import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import roles from "../config/roles.js";
import toJSON from "./plugins/toJSON.plugin.js";
import paginate from "./plugins/paginate.plugin.js";

const addressSchema = new Schema(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      sparse: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: 6,
      private: true, 
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    referralCode: {
      type: String,
    },
    referPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: [addressSchema],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

userSchema.plugin(toJSON);

userSchema.plugin(paginate);


userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};


userSchema.statics.isMobileNumberTaken = async function (mobileNumber, excludeUserId) {
  const user = await this.findOne({ mobileNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.password) next();
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

export const User = mongoose.model("User", userSchema);
