// import mongoose from "mongoose";

// const FIVE_STAR = [1, 2, 3, 4, 5];

// const IPDPatientSchema = new mongoose.Schema(
//   {
//     patientName: { type: String, required: true },
//     contact: { type: String, required: true },
//     bedNo: { type: String, required: true },
//     language: { type: String },
//     consultantDoctorName: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJDoctor"},
//     ratings: {
//       overallExperience: { type: Number, enum: FIVE_STAR },
//       consultantDoctorServices: { type: Number, enum: FIVE_STAR },
//       medicalAdminDoctorService: { type: Number, enum: FIVE_STAR},
//       billingServices: { type: Number,  enum: FIVE_STAR },
//       housekeeping: { type: Number, enum: FIVE_STAR },
//       maintenance: { type: Number, enum: FIVE_STAR },
//       radiologyDiagnosticServices: { type: Number, enum: FIVE_STAR },
//       pathologyDiagnosticServices: { type: Number, enum: FIVE_STAR },
//       dietitianServices: { type: Number, enum: FIVE_STAR },
//       nursing: { type: Number, enum: FIVE_STAR},
//       security: { type: Number, enum: FIVE_STAR },
//     },
//     comments: { type: String },

//     overallRecommendation: {
//       type: Number,
//       enum: [1,2,3,4,5,6,7,8,9,10],
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// IPDPatientSchema.index({ patientName: 1 });
// IPDPatientSchema.index({ bedNo: 1 });
// IPDPatientSchema.index({ createdAt: -1 });

// export default IPDPatientSchema;


import mongoose from "mongoose";

const IPDPatientSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    contact: { type: String, required: true },
    bedNo: { type: String, required: true },
    language: { type: String },

    consultantDoctorName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GIRIRAJDoctor",
      required: false,
    },

    // ⭐ DYNAMIC RATINGS (unlimited keys)
    ratings: {
      type: Map,
      of: {
        type: Number,
        min: 1,
        max: 5,
      },
      default: {},
    },

    comments: { type: String },

    // ⭐ NPS always required
    overallRecommendation: {
      type: Number,
      enum: [1,2,3,4,5,6,7,8,9,10],
      required: true,
    },
  },
  { timestamps: true }
);

IPDPatientSchema.index({ patientName: 1 });
IPDPatientSchema.index({ bedNo: 1 });
IPDPatientSchema.index({ createdAt: -1 });

export default IPDPatientSchema;
