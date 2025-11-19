import mongoose from "mongoose";

const TaskListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "List name is required"],
      trim: true,
    },

    icon: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "#8b5cf6",
    },

    // 👤 linked user (multi-tenant)
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
  },
  { timestamps: true }
);

export default TaskListSchema;
