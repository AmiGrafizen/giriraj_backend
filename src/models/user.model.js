import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    // ✅ Core identity fields
    mobileNumber: { type: String, required: true, unique: true },
    alternativeMobile: { type: String, default: null },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },

    // ✅ Authentication fields
    password: {
      type: String,
      trim: true,
      minlength: 6,
      required: true,
      select: false, // hide password in normal queries
    },

    // ✅ CometChat Integration Fields (🆕 Added)
    cometUid: { type: String, trim: true }, // store CometChat UID like "user_<ObjectId>"
    cometToken: { type: String, trim: true }, // optional cached token (auto-refresh supported)

    // ✅ Notifications / Push
    fcmTokens: { type: [String], default: [] },

    // ✅ Profile Information
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    dateOfBirth: { type: Date },
    age: { type: Number },
    image: { type: String },
    avatarUri: { type: String }, // CometChat avatar can use this
    country: { type: String },
    state: { type: String },
    city: { type: String },

    height: { type: Number },
    weight: { type: Number },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },

    chronicDiseases: [{ type: String }],
    allergies: [{ type: String }],

    // ✅ Hospital Security Code (HSC)
    hsc: {
      type: Number,
      unique: true,
      min: 100,
      max: 999,
    },

    otpHash: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

/* ✅ Pre-save hook for:
   - Unique HSC
   - Hash password if modified
   - Generate default CometChat UID
*/
userSchema.pre('save', async function (next) {
  // 1️⃣ Generate unique HSC
  if (!this.hsc) {
    let code;
    let exists = true;
    while (exists) {
      code = Math.floor(100 + Math.random() * 900);
      exists = await mongoose.models.User?.findOne({ hsc: code });
    }
    this.hsc = code;
  }

  // 2️⃣ Hash password if changed
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // 3️⃣ Generate CometChat UID if missing
  if (!this.cometUid && this._id) {
    this.cometUid = `user_${this._id.toString()}`;
  }

  next();
});

/* ✅ Static Method — Check mobile number availability */
userSchema.statics.isMobileNumberTaken = async function (mobileNumber) {
  const user = await this.findOne({ mobileNumber });
  return !!user;
};

/* ✅ Instance Method — Compare password safely */
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* ✅ Indexes for better performance */
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ mobileNumber: 1 }, { unique: true });
userSchema.index({ fcmTokens: 1 });
userSchema.index({ cometUid: 1 }); // 🔥 for CometChat lookups

export default userSchema;
