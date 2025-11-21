import mongoose from "mongoose";

const FIVE_STAR = [1, 2, 3, 4, 5];

const EmployeeFeedbackSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },

    // ⭐ Ratings
    ratings: {
      jobSatisfaction: { type: Number, enum: FIVE_STAR },
      feelingValued: { type: Number, enum: FIVE_STAR },
      growthOpportunities: { type: Number, enum: FIVE_STAR },
      trainingSupport: { type: Number, enum: FIVE_STAR },
      welfareFacility: { type: Number, enum: FIVE_STAR },

      // 🆕 Include rating for open feedback areas too
      trainingNeeded: { type: Number, enum: FIVE_STAR },
      challengesSupportNeeded: { type: Number, enum: FIVE_STAR },
      suggestions: { type: Number, enum: FIVE_STAR },
    },

    // 📝 Comments for each area
    comments: {
      trainingNeeded: { type: String },
      challengesSupportNeeded: { type: String },
      suggestions: { type: String },
    },

    // 😊 NPS (overall recommendation)
    overallRecommendation: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      required: true,
    },
  },
  { timestamps: true }
);

EmployeeFeedbackSchema.index({ employeeName: 1, createdAt: -1 });

export default EmployeeFeedbackSchema;
