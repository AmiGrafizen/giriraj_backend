import mongoose from "mongoose";

const LanguageTextSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJWebUser", required: true },
  lang: { type: String, required: true },
  fields: { type: Object, default: {} }
});

const OPDSetupSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJWebUser", required: true },

    selectedLanguages: [{ type: String }],

    basic: {
      logo: String,
      favicon: String
    },

    welcomeScreen: [LanguageTextSchema],
    personalDetails: [LanguageTextSchema],
    complaintDetails: [LanguageTextSchema], // OPD Concerns
    ratingPage: [LanguageTextSchema],
    npsPage: [LanguageTextSchema],
    thankYouModal: [LanguageTextSchema]
  },
  { timestamps: true }
);

export default OPDSetupSchema;
