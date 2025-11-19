import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      trim: true,
      default: null,
    },
    important: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      trim: true,
      default: "#8b5cf6",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GIRIRAJTaskList",
      required: true,
    },

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

export default TaskSchema;
