import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, default: "" },

    // ✅ Single field that references either GIRIRAJUser or GIRIRAJRoleUser
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

    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default noteSchema;
