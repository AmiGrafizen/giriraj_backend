import mongoose from "mongoose";

/* ============================================================
   ⭐ CONCERN ITEM SCHEMA (FOR EACH DEPARTMENT)
============================================================ */
const ConcernItemSchema = new mongoose.Schema(
  {
    topic: { type: String },

    mode: { type: String, enum: ["text", "image", "voice"], default: "text" },
    text: { type: String },
    attachments: [{ type: String }],

    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "forwarded",
        "resolved",
        "escalated",
        "resolved_by_admin",
      ],
      default: "open",
    },

    resolvedByAdmin: { type: Boolean, default: false },
    updatedByAdmin: { type: Boolean, default: false },
    adminNote: { type: String },

    progress: {
      note: { type: String },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      updatedAt: { type: Date, default: Date.now },
    },

    forward: {
      toDepartment: { type: String },
      note: { type: String },
      forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      forwardedAt: { type: Date },
    },

    escalation: {
      level: {
        type: String,
        enum: ["PGRO", "CEO", "Board of Directors", "Medical Director"],
      },
      note: { type: String },
      escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      escalatedAt: { type: Date },
      toUser: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
    },

    resolution: {
      actionType: {
        type: String,
        enum: ["RCA", "CA", "PA"],
        default: null,
      },
      actionNote: { type: String },
      proof: [{ type: String }],
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      resolvedAt: { type: Date },
      resolvedType: { type: String, enum: ["admin", "staff"], default: "staff" },
    },
  },
  { _id: false }
);

/* ============================================================
   ⭐ SUPPORTING SUBSCHEMAS
============================================================ */
const EscalationSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["PGRO", "CEO", "Board of Directors", "Medical Director"],
      required: true,
    },
    note: { type: String, required: true },
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
    escalatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ForwardSchema = new mongoose.Schema(
  {
    toDepartment: { type: String },
    note: { type: String },
    forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
    forwardedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProgressSchema = new mongoose.Schema(
  {
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ResolutionSchema = new mongoose.Schema(
  {
    note: { type: String },
    proof: [{ type: String }],
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
    resolvedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ============================================================
   ⭐ COUNTER SCHEMA (AUTO-ID)
============================================================ */
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
  seriesChar: { type: String, default: "A" },
});

// Register Counter model only if not already created
if (!mongoose.models.Counter) {
  mongoose.model("Counter", CounterSchema);
}

/* ============================================================
   ⭐ MAIN IPD CONCERN SCHEMA
============================================================ */
const IPDConcernSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    complaintId: { type: String, unique: true },

    contact: { type: String },
    bedNo: { type: String },
    language: { type: String },

    consultantDoctorName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GIRIRAJDoctor",
    },

    priority: {
      type: String,
      enum: ["Urgent", "Normal"],
      default: "Normal",
    },

    // ⭐ Departments
    doctorServices: { type: ConcernItemSchema },
    billingServices: { type: ConcernItemSchema },
    housekeeping: { type: ConcernItemSchema },
    maintenance: { type: ConcernItemSchema },
    diagnosticServices: { type: ConcernItemSchema },
    dietitianServices: { type: ConcernItemSchema },
    security: { type: ConcernItemSchema },
    nursing: { type: ConcernItemSchema },

    comments: { type: String },

    status: {
      type: String,
      enum: ["open", "in_progress", "forwarded", "resolved", "escalated", "partial"],
      default: "open",
      lowercase: true,
    },

    note: { type: String },

    progress: ProgressSchema,
    resolution: ResolutionSchema,
    escalations: [EscalationSchema],
    forwards: [ForwardSchema],
  },
  { timestamps: true }
);

/* ============================================================
   ⭐ VIRTUAL: MODULE LIST
============================================================ */
IPDConcernSchema.virtual("modules").get(function () {
  return [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "nursing",
  ].filter((key) => !!this[key]);
});

IPDConcernSchema.set("toJSON", { virtuals: true });
IPDConcernSchema.set("toObject", { virtuals: true });

/* ============================================================
   ⭐ AUTO-GENERATE complaintId WITHOUT COUNTER MODEL
   ✔ Uses this.constructor → ALWAYS SAFE
   ✔ No Counter model
   ✔ No buffering timeout
============================================================ */
IPDConcernSchema.pre("save", async function (next) {
  if (this.complaintId) return next();

  try {
    const Model = this.constructor; // ⭐ ALWAYS gives the current model

    // 1️⃣ Fetch last record
    const lastRecord = await Model
      .findOne({ complaintId: { $exists: true } })
      .sort({ createdAt: -1 })
      .lean();

    let seriesChar = "A";
    let seq = 0;

    if (lastRecord?.complaintId) {
      const last = lastRecord.complaintId;  // Example: A00025
      seriesChar = last.charAt(0);          // A
      seq = parseInt(last.slice(1));        // 25
    }

    // 2️⃣ Increment
    seq += 1;

    // 3️⃣ Move to next alphabet after 99999
    if (seq > 99999) {
      seq = 1;
      seriesChar = String.fromCharCode(seriesChar.charCodeAt(0) + 1);
    }

    // 4️⃣ Generate final complaint ID
    this.complaintId = `${seriesChar}${String(seq).padStart(5, "0")}`;

    next();
  } catch (err) {
    console.error("❌ complaintId generation failed:", err);
    next(err);
  }
});



/* ============================================================
   ⭐ REGISTER MODEL SAFELY
============================================================ */
export default IPDConcernSchema;
 ;
