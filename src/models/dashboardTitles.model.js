import mongoose from "mongoose";

const dashboardTitleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJWebUser", required: true, unique: true },

    titles: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default dashboardTitleSchema;
