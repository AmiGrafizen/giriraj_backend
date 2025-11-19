import mongoose from "mongoose";

const bugReportSchema = new mongoose.Schema(
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
    screenshot: {
      type: String, // image URL or path
      required: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

export default bugReportSchema;
