import mongoose from "mongoose";

const RatingItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 }, // ⭐ allow 0 rating (fix)
    comment: { type: String, default: "" }
  },
  { _id: false }
);

const ConsultantFeedbackSchema = new mongoose.Schema(
  {
    // ⭐ FIX: accept frontend language values
    language: {
      type: String,
      enum: ["en", "hi", "gu"],   // FIXED 👍
      default: "en",
    },

    doctorName: { type: String, trim: true },

    // ---------------------------------------------------------
    // ⭐ HOSPITAL SERVICE RATINGS
    // ---------------------------------------------------------
    serviceRatings: {
      type: [RatingItemSchema],
      default: [
        { label: "OPD Services – Overall performance" },
        { label: "Front Desk – Admission, discharge, billing" },
        { label: "ER Team – Coordination and response" },
        { label: "Medical Officers – Support and efficiency" },
        { label: "CMO – Clinical coordination" },
        { label: "Patient Documentation – Accuracy and upkeep" },
        { label: "Lab – Report speed and quality" },
        { label: "Radiology – Timely and effective support" },
        { label: "OT Team – Skill and coordination (Surgeons/Anaesthetists)" },
        { label: "Pharmacy – Availability of medicines" },
        { label: "Dietary – Food quality and hygiene" },
        { label: "Security – Professionalism and vigilance" },
        { label: "Nursing – Care, medication, coordination" },
        { label: "Maintenance/IT – Quick and reliable support" },
        { label: "Housekeeping – Cleanliness and standards" }
      ]
    },

    // ---------------------------------------------------------
    // ⭐ BD TEAM RATINGS
    // ---------------------------------------------------------
    bdRatings: {
      type: [RatingItemSchema],
      default: [
        { label: "BD Team – Cooperation and support" },
        { label: "BD – Any extra help needed" }
      ]
    },

    // ---------------------------------------------------------
    // ⭐ MANAGEMENT FEEDBACK QUESTIONS
    // ---------------------------------------------------------
    managementFeedback: {
      type: [RatingItemSchema],
      default: [
        { label: "Major challenges this month" },
        { label: "Suggestions for process improvement" },
        { label: "Extra administrative support needed" },
        { label: "Staff attitude and teamwork" },
        { label: "Training needs for staff" }
      ]
    },

    finalComments: { type: String },

    ipAddress: { type: String },
    deviceInfo: { type: String },

  },
  { timestamps: true }
);

export default ConsultantFeedbackSchema;
