import mongoose from "mongoose";

const hospitalProfileSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "GIRIRAJWebUser", 
      required: true 
    },

    hospitalName: { type: String, required: true },
    address: { type: String, required: true },

    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },

    languages: { type: [String], default: [] },

    contact: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

export default hospitalProfileSchema;
