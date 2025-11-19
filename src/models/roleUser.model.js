import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roleUserSchema = new mongoose.Schema(
  {
    // ✅ Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // ✅ Authentication
    password: { type: String, required: true, minlength: 6, select: false },

    // ✅ Role Reference
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJRole", required: true },

    // ✅ Access Control
    loginEnabled: { type: Boolean, default: true },

    // ✅ UI & Chat Enhancements
    avatar: { type: String, default: "" }, // profile image (used in chat)
    cometUid: { type: String, trim: true }, // 🆕 for CometChat user ID
    cometToken: { type: String, trim: true }, // 🆕 store token if generated

    // ✅ Notifications (optional future use)
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

/* ✅ Pre-Save Hooks */
roleUserSchema.pre("save", async function (next) {
  // 1️⃣ Hash password if modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // 2️⃣ Auto-generate CometChat UID if missing
  if (!this.cometUid && this._id) {
    this.cometUid = `role_${this._id.toString()}`;
  }

  next();
});

/* ✅ Instance Method: Compare password */
roleUserSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* ✅ Indexes for better performance */
roleUserSchema.index({ email: 1 }, { unique: true });
roleUserSchema.index({ cometUid: 1 });
roleUserSchema.index({ roleId: 1 });

export default roleUserSchema;
