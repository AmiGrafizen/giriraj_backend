import mongoose from "mongoose";

const notificationSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["GIRIRAJUser", "GIRIRAJRoleUser"],
    },

    // ✅ Toggle settings
    opd: { type: Boolean, default: false },
    ipd: { type: Boolean, default: false },
    complaint: { type: Boolean, default: true }, // always ON by default
    internalComplaint: { type: Boolean, default: false },
    statusChange: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default notificationSettingSchema;
