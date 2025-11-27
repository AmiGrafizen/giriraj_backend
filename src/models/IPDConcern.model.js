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
      actionType: { type: String, enum: ["RCA", "CA", "PA"], default: null },
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
   ⭐ SUBSCHEMAS
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
   ⭐ MAIN INTERNAL COMPLAINT SCHEMA
============================================================ */
const InternalComplaintSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },

    complaintId: { type: String, unique: true },

    contactNo: { type: String },
    floorNo: { type: String },

    // ⭐ Departments
    maintenance: { type: ConcernItemSchema },
    itDepartment: { type: ConcernItemSchema },
    bioMedicalDepartment: { type: ConcernItemSchema },
    nursing: { type: ConcernItemSchema },
    medicalAdmin: { type: ConcernItemSchema },
    frontDesk: { type: ConcernItemSchema },
    housekeeping: { type: ConcernItemSchema },
    dietitian: { type: ConcernItemSchema },
    pharmacy: { type: ConcernItemSchema },
    security: { type: ConcernItemSchema },
    hr: { type: ConcernItemSchema },
    icn: { type: ConcernItemSchema },
    mrd: { type: ConcernItemSchema },
    accounts: { type: ConcernItemSchema },

    comments: { type: String },

    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "forwarded",
        "resolved",
        "escalated",
        "partial",
        "resolved_by_admin",
      ],
      default: "open",
      lowercase: true,
      trim: true,
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
   ⭐ VIRTUAL: ACTIVE MODULES LIST
============================================================ */
InternalComplaintSchema.virtual("modules").get(function () {
  const modules = [];
  const keys = [
    "maintenance",
    "itDepartment",
    "bioMedicalDepartment",
    "nursing",
    "medicalAdmin",
    "frontDesk",
    "housekeeping",
    "dietitian",
    "pharmacy",
    "security",
    "hr",
    "icn",
    "mrd",
    "accounts",
  ];

  keys.forEach((key) => {
    if (this[key]) modules.push(key);
  });

  return modules;
});

InternalComplaintSchema.set("toJSON", { virtuals: true });
InternalComplaintSchema.set("toObject", { virtuals: true });

/* ============================================================
   ⭐ AUTO GENERATE complaintId (NO COUNTER MODEL)
============================================================ */
InternalComplaintSchema.pre("save", async function (next) {
  if (this.complaintId) return next();

  try {
    const Model = this.constructor;

    const last = await Model.findOne({ complaintId: { $exists: true } })
      .sort({ createdAt: -1 })
      .lean();

    let seriesChar = "A";
    let seq = 0;

    if (last?.complaintId) {
      seriesChar = last.complaintId.charAt(0);
      seq = parseInt(last.complaintId.slice(1));
    }

    seq += 1;

    if (seq > 99999) {
      seq = 1;
      seriesChar = String.fromCharCode(seriesChar.charCodeAt(0) + 1);
    }

    this.complaintId = `${seriesChar}${String(seq).padStart(5, "0")}`;

    next();
  } catch (err) {
    console.error("❌ Internal Complaint ID generation failed:", err);
    next(err);
  }
});

/* ============================================================
   ⭐ REGISTER MODEL SAFELY
============================================================ */
export default InternalComplaintSchema;
