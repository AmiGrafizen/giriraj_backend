  import mongoose from "mongoose";

  /* ---------------------- ConcernItemSchema ---------------------- */
  const ConcernItemSchema = new mongoose.Schema(
    {
      topic: { type: String },
      mode: { type: String, enum: ["text", "image", "voice"], default: "text" },
      text: { type: String },
      attachments: [{ type: String }],

      // ✅ Track per-department status
      status: {
        type: String,
        enum: [
          "open",
          "in_progress",
          "forwarded",
          "resolved",
          "escalated",
          "resolved_by_admin", // ✅ NEW
        ],
        default: "open",
        lowercase: true,
        trim: true,
      },

      // ✅ Progress details
      progress: {
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
        updatedAt: { type: Date, default: Date.now },
      },

      // ✅ Forward details
      forward: {
        toDepartment: { type: String },
        note: { type: String },
        forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
        forwardedAt: { type: Date },
      },

      // ✅ Escalation details
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

      // ✅ Resolution details
      resolution: {
        note: { type: String },
        proof: [{ type: String }],
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
        resolvedAt: { type: Date },
        resolvedType: { type: String, enum: ["admin", "staff"], default: "staff" }, // ✅ NEW
      },
    },
    { _id: false }
  );

  /* ---------------------- Sub-schemas ---------------------- */
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

  const ResolutionSchema = new mongoose.Schema(
    {
      note: { type: String, required: true },
      proof: [{ type: String }],
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      resolvedAt: { type: Date, default: Date.now },
    },
    { _id: false }
  );

  const ForwardSchema = new mongoose.Schema(
    {
      toDepartment: { type: String, required: true },
      note: { type: String },
      forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      forwardedAt: { type: Date, default: Date.now },
    },
    { _id: false }
  );

  const ProgressSchema = new mongoose.Schema(
    {
      note: { type: String, required: true },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "GIRIRAJUser" },
      updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
  );

  /* ---------------------- Counter Schema ---------------------- */
  const CounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
    seriesChar: { type: String, default: "A" },
  });
  const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

  /* ---------------------- Internal Complaint Schema ---------------------- */
  const InternalComplaintSchema = new mongoose.Schema(
    {
      employeeName: { type: String, required: true },
      employeeId: { type: String, required: true },
      contactNo: { type: String },
      floorNo: { type: String },
      complaintId: { type: String, unique: true },

      maintenance: { type: ConcernItemSchema, default: undefined },
      itDepartment: { type: ConcernItemSchema, default: undefined },
      bioMedicalDepartment: { type: ConcernItemSchema, default: undefined },
      nursing: { type: ConcernItemSchema, default: undefined },
      medicalAdmin: { type: ConcernItemSchema, default: undefined },
      frontDesk: { type: ConcernItemSchema, default: undefined },
      housekeeping: { type: ConcernItemSchema, default: undefined },
      dietitian: { type: ConcernItemSchema, default: undefined },
      pharmacy: { type: ConcernItemSchema, default: undefined },
      security: { type: ConcernItemSchema, default: undefined },
      hr: { type: ConcernItemSchema, default: undefined },
      icn: { type: ConcernItemSchema, default: undefined },
      mrd: { type: ConcernItemSchema, default: undefined },
      accounts: { type: ConcernItemSchema, default: undefined },

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
          "resolved_by_admin", // ✅ Added
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

  InternalComplaintSchema.virtual("modules").get(function () {
    const modules = [];
    if (this.maintenance) modules.push("maintenance");
    if (this.itDepartment) modules.push("it_department");
    if (this.bioMedicalDepartment) modules.push("bio_medical");
    if (this.nursing) modules.push("nursing");
    if (this.medicalAdmin) modules.push("medical_admin");
    if (this.frontDesk) modules.push("front_desk");
    if (this.housekeeping) modules.push("housekeeping");
    if (this.dietitian) modules.push("dietitian");
    if (this.pharmacy) modules.push("pharmacy");
    if (this.security) modules.push("security");
    if (this.hr) modules.push("hr");
    if (this.icn) modules.push("icn");
    if (this.mrd) modules.push("mrd");
    if (this.accounts) modules.push("accounts");
    return modules;
  });

  InternalComplaintSchema.set("toJSON", { virtuals: true });
  InternalComplaintSchema.set("toObject", { virtuals: true });

  InternalComplaintSchema.pre("save", async function (next) {
    if (this.complaintId) return next();
    const counter = await Counter.findOneAndUpdate(
      { name: "internalComplaintId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    let { seq, seriesChar } = counter;
    if (seq > 99999) {
      seq = 1;
      seriesChar = String.fromCharCode(seriesChar.charCodeAt(0) + 1);
      await Counter.updateOne({ name: "internalComplaintId" }, { seq, seriesChar });
    }

    this.complaintId = `${seriesChar}${seq.toString().padStart(5, "0")}`;
    next();
  });

  InternalComplaintSchema.index({ complaintId: 1 }, { unique: true });
  InternalComplaintSchema.index({ status: 1 });
  InternalComplaintSchema.index({ createdAt: -1 });

  export default InternalComplaintSchema;
