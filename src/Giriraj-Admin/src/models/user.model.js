import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    mobileNumber: { type: String, required: true, unique: true },
    alternativeMobile: { type: String, default: null },
    email: { type: String, lowercase: true, trim: true },

    otpHash: String,
    otpExpires: Date,

    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    dateOfBirth: { type: Date },
    age: { type: Number },
    image: String,
    country: { type: String },
    state: { type: String },
    city: { type: String },

    height: { type: Number },
    weight: { type: Number },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    avatarUri: String,

    chronicDiseases: [{ type: String }],
    allergies: [{ type: String }],

    hsc: {
      type: Number,
      unique: true,
      min: 100,
      max: 999,
    },

    // 🔑 Secure password
    password: {
      type: String,
      trim: true,
      minlength: 6,
      required: true,
    },

    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ✅ Pre-save hook for unique HSC
userSchema.pre('save', async function (next) {
  if (!this.hsc) {
    let code;
    let exists = true;

    while (exists) {
      code = Math.floor(100 + Math.random() * 900);
      exists = await mongoose.models.User?.findOne({ hsc: code });
    }
    this.hsc = code;
  }

  // ✅ Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// ✅ Check if mobile is taken
userSchema.statics.isMobileNumberTaken = async function (mobileNumber) {
  const user = await this.findOne({ mobileNumber });
  return !!user;
};

// ✅ Check password match
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

// After schema definition
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ "fcmTokens": 1 });
userSchema.index({ role: 1 });
    

export default userSchema;
