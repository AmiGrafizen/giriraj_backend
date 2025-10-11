import mongoose from "mongoose";

const FIVE_STAR = [1, 2, 3, 4, 5]; 

const OPDFeedbackSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    contact: { type: String, required: true },
    language: { type: String },
    consultantDoctorName:  { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJDoctor"},

    ratings: {
      appointment: { type: Number, enum: FIVE_STAR },
      receptionStaff: { type: Number, enum: FIVE_STAR },
      radiologyDiagnosticServices: { type: Number, enum: FIVE_STAR },
      pathologyDiagnosticServices: { type: Number, enum: FIVE_STAR },
      doctorServices: { type: Number, enum: FIVE_STAR },
      security: { type: Number, enum: FIVE_STAR },
      cleanliness: { type: Number, enum: FIVE_STAR},
    },

    comments: { type: String },

    awareness: {
      type: String,
      enum: [
        "socialMedia",
        "throughDoctor",
        "hoarding",
        "radio",
        "website",
        "friendsRelatives",
        "walkIn",
        "others",
      ],
    },

    overallRecommendation: {
      type: Number,
      enum: [1,2,3,4,5,6,7,8,9,10],
      required: true,
    },
  },
  { timestamps: true }
);

OPDFeedbackSchema.index({ patientName: 1 });
OPDFeedbackSchema.index({ contact: 1 });
OPDFeedbackSchema.index({ createdAt: -1 });


export default OPDFeedbackSchema
