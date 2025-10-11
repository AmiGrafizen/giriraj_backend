import mongoose from "mongoose";

const ConcernItemSchema = new mongoose.Schema(
  {
    topic: { type: String },
    mode: { type: String, enum: ["text", "image", "voice"], default: "text" },
    text: { type: String },
    attachments: [{ type: String }],
  },
  { _id: false }
);

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

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
  seriesChar: { type: String, default: "A" },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

const IPDConcernSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    complaintId: { type: String, unique: true }, // auto-generated
    contact: { type: String, alias: "contactNo" },
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

    doctorServices: { type: ConcernItemSchema, default: undefined },
    billingServices: { type: ConcernItemSchema, default: undefined },
    housekeeping: { type: ConcernItemSchema, default: undefined },
    maintenance: { type: ConcernItemSchema, default: undefined },
    diagnosticServices: { type: ConcernItemSchema, default: undefined },
    dietitianServices: { type: ConcernItemSchema, default: undefined },
    security: { type: ConcernItemSchema, default: undefined },
    nursing: { type: ConcernItemSchema, default: undefined },

    comments: { type: String },
    status: {
      type: String,
      enum: ["open", "in_progress", "forwarded", "resolved", "escalated"],
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

IPDConcernSchema.virtual("modules").get(function () {
  const modules = [];
  if (this.doctorServices) modules.push("doctor_service");
  if (this.billingServices) modules.push("billing_service");
  if (this.housekeeping) modules.push("housekeeping");
  if (this.maintenance) modules.push("maintenance");
  if (this.diagnosticServices) modules.push("diagnostic_service");
  if (this.dietitianServices) modules.push("dietetics");
  if (this.security) modules.push("security");
  if (this.nursing) modules.push("nursing");
  return modules;
});

IPDConcernSchema.set("toJSON", { virtuals: true });
IPDConcernSchema.set("toObject", { virtuals: true });

IPDConcernSchema.pre("save", async function (next) {
  if (this.complaintId) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "complaintId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  let { seq, seriesChar } = counter;

  if (seq > 99999) {
    seq = 1;
    seriesChar = String.fromCharCode(seriesChar.charCodeAt(0) + 1);
    await Counter.updateOne({ name: "complaintId" }, { seq, seriesChar });
  }

  this.complaintId = `${seriesChar}${seq.toString().padStart(5, "0")}`;
  next();
});

IPDConcernSchema.index({ complaintId: 1 }, { unique: true });
IPDConcernSchema.index({ patientName: 1 });
IPDConcernSchema.index({ status: 1 });
IPDConcernSchema.index({ createdAt: -1 });

export default IPDConcernSchema;
