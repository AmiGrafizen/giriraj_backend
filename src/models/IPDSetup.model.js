import mongoose from "mongoose";

const LanguageTextSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJWebUser", required: true },
  lang: { type: String, required: true },
  fields: { type: Object, default: {} }
});

const SettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJWebUser", required: true },

  selectedLanguages: [{ type: String }],

  basic: {
    logo: String,
    favicon: String
  },

  welcomeScreen: [LanguageTextSchema],
  personalDetails: [LanguageTextSchema],
  feedbackConcerns: [LanguageTextSchema],
  concernDetails: [LanguageTextSchema],
  ratingPage: [LanguageTextSchema],
  npsPage: [LanguageTextSchema],
  thankYouModal: [LanguageTextSchema],

}, { timestamps: true });

export default SettingsSchema;
