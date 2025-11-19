import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" }], // specific users
    department: { type: String }, // e.g. "Billing", "Housekeeping"
    tokens: [{ type: String }],
    showInStackBar: { type: Boolean, default: true },
    status: { type: String, enum: ["sent", "failed", "partial"], default: "sent" }
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ sentTo: 1 });


export default notificationSchema;

