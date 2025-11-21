import { girirajModels } from "../db/index.js";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { sendNotification } from "../utils/sendNotification.js";
import { extractDepartment } from "../utils/extractDepartment.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { getActiveModel } from "../db/index.js";

const OPD_KEYS = ["appointment", "receptionStaff", "diagnosticServices", "doctorServices", "security"];
const IPD_KEYS = [
  "overallExperience", "doctorServices", "billingServices", "housekeeping",
  "maintenance", "diagnosticServices", "dietitianServices", "security",
];
const DEPT_LABELS = {
  receptionStaff: "Front Desk",
  nursing: "Nursing",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  pharmacy: "Pharmacy",
  laboratory: "Laboratory",
  diagnosticServices: "Laboratory",
};

const DEPT_LABEL = {
  doctorServices: "Doctor",
  billingServices: "Billing",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnosticServices: "Diagnostic",
  dietitianServices: "Dietitian",
  security: "Security",
  nursing: "Nursing",
};

const SERVICE_LABELS = {
  doctor_service: "Doctor",
  billing_service: "Billing",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnostic_service: "Diagnostic",
  dietetics: "Dietitian",
  security: "Security",
  nursing: "Nursing"
};

const INTERNAL_DEPT_KEYS = [
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

const ratingLabels = {
  5: 'Excellent',
  4: 'Very Good',
  3: 'Good',
  2: 'Poor',
  1: 'Very Poor'
};

const RATING_LABELS = {
  overallExperience: "Overall Experience",
  consultantDoctorServices: "Consultant Doctor",
  medicalAdminDoctorService: "Medical Admin Doctor",
  billingServices: "Billing",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  radiologyDiagnosticServices: "Radiology",
  pathologyDiagnosticServices: "Pathology",
  dietitianServices: "Dietitian",
  nursing: "Nursing",
  security: "Security",
};


// Which concern subdocs to scan on each IPD record
const CONCERN_KEYS = [
  "doctorServices",
  "billingServices",
  "housekeeping",
  "maintenance",
  "diagnosticServices",
  "dietitianServices",
  "security",
  "nursing",
];

function getModel(modelName) {
  if (!girirajModels || typeof girirajModels !== "object") {
    console.error("❌ girirajModels not initialized or invalid");
    return null;
  }

  const allKeys = Object.keys(girirajModels);
  if (!allKeys.length) {
    console.error("⚠️ No models loaded in girirajModels");
    return null;
  }

  // 🧠 Try to find by case-insensitive or partial match
  const lowerTarget = modelName.toLowerCase();
  const foundKey = allKeys.find(
    (k) => k.toLowerCase() === lowerTarget || k.toLowerCase().includes(lowerTarget)
  );

  if (!foundKey) {
    console.warn(`⚠️ Model "${modelName}" not found. Available models:`, allKeys);
    return null;
  }

  let model = girirajModels[foundKey];

  // 🧩 If wrapped { primary, secondary }, unwrap safely
  if (model && typeof model.find !== "function") {
    model = model.primary || model.secondary || model.default || model.model;
  }

  if (!model || typeof model.find !== "function") {
    console.error(`❌ "${foundKey}" is not a valid Mongoose model.`, model);
    return null;
  }

  console.log(`✅ Using model: ${foundKey}`);
  return model;
}


function hasConcern(item) {
  if (!item) return false;
  if (item.text && String(item.text).trim()) return true;
  if (Array.isArray(item.attachments) && item.attachments.length) return true;
  if (item.topic && String(item.topic).trim()) return true;
  return false;
}

async function countConcernsInRange({ start, end }) {
  const docs = await girirajModels.GIRIRAJIPDPatients
    ?.find({ createdAt: { $gte: start, $lte: end } }).lean()
    .select({ concerns: 1 })
    .lean() || [];

  let total = 0;
  for (const d of docs) {
    const c = d?.concerns || {};
    for (const k of CONCERN_KEYS) {
      if (hasConcern(c[k])) total += 1;
    }
  }
  return total;
}

const createIPDPatient = async (payload) => {
  return await girirajModels.GIRIRAJIPDPatients?.create(payload);
};

const getIPDPatients = async (page = 1, limit = 50) => {
  const IPDModel = getModel("GIRIRAJIPDPatients");
  const [patients, total] = await Promise.all([
    IPDModel.find()
      .select(
        "patientName bedNo contact consultantDoctorName ratings comments overallRecommendation createdAt"
      )
      .populate("consultantDoctorName", "name qualification")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    IPDModel.countDocuments(),
  ]);


  return {
    patients,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

const getIPDPatientById = async (id) => {
  const IPDModel = getModel("GIRIRAJIPDPatients");
  const patient = await IPDModel.findById(id).lean()
    .select(
      "patientName contact bedNo language consultantDoctorName ratings comments overallRecommendation createdAt updatedAt"
    )
    .populate("consultantDoctorName", "name qualification")
    .lean();



  if (!patient) return null;

  return patient; // ✅ must return
};



const deleteIPDPatientById = async (id) => {
  const IPDModel = getModel("GIRIRAJIPDPatients")
  return await IPDModel.findByIdAndDelete(id);
}

const updateIPDPatientById = async (id, update) => {
  const IPDModel = getModel("GIRIRAJIPDPatients");
  const patient = await IpdModel.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

async function getIPDPatientByRating() {
  const IPDModel = getModel("GIRIRAJIPDPatients");
  const feedbacks = await IPDModel.find().lean();

  const grouped = {};

  for (const fb of feedbacks) {
    const label = ratingLabels[fb.rating] || 'Unknown';

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push({
      patientName: fb.patientName,
      contact: fb.contact,
      doctorName: fb.doctorName,
      bedNumber: fb.bedNumber,
      department: fb.department,
      date: fb.date,
      comment: fb.comment,
      rating: fb.rating,
    });
  }

  return grouped;
}


const createIPDConcern = async (payload) => {
  
  return await girirajModels.GIRIRAJIPDConcern?.create(payload);
};

const getIPDConcern = async (useBackup = false) => {
  try {
    // 🧠 Step 1: Fetch the model safely using your helper
    let Model = getModel("GIRIRAJIPDConcern");

    // 🧩 Step 2: If your model is wrapped (e.g. { primary, secondary }), unwrap it
    if (Model && typeof Model.find !== "function") {
      Model = useBackup ? Model.secondary : Model.primary;
    }

    // 🧩 Step 3: Validate final model
    if (!Model || typeof Model.find !== "function") {
      console.error("❌ Invalid model structure:", Model);
      throw new Error("GIRIRAJIPDConcern model not found or not a valid Mongoose model");
    }

    // ✅ Step 4: Query the database
    const data = await Model.find({})
      .populate("consultantDoctorName", "name qualification")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ IPD Concerns fetched successfully (${data.length} records)`);
    return data;
  } catch (err) {
    console.error("❌ Error in getIPDConcern:", err.message);
    throw err;
  }
};


const getIPDPaConcernById = async (id, useBackup = false) => {
  const Model = getModel("GIRIRAJIPDConcern", useBackup); // ✅ Correct model

  if (!Model) {
    throw new Error("❌ GIRIRAJIPDConcern model not found or invalid");
  }

  return await Model.findById(id)
    .populate("consultantDoctorName", "name qualification")
    .lean();
};
const deleteIPDConcernById = async (id) => {
  return await girirajModels.GIRIRAJIPDConcern?.findByIdAndDelete(id);
}

const updateIPDConcernById = async (id, update) => {
  const patient = await girirajModels.GIRIRAJIPDConcern?.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

const createOPDPatient = async (payload) => {
  const Model = getModel("GIRIRAJOpd");
  if (!Model) throw new Error("OPD model not found");

  return await Model.create(payload);
};

const getOPDPatients = async () => {
  const Model = getModel("GIRIRAJOpd");

  if (!Model || typeof Model.find !== "function") {
    throw new Error("❌ GIRIRAJOpd model not found or invalid");
  }

  return await Model.find({})
    .populate("consultantDoctorName", "name qualification")
    .sort({ createdAt: -1 })
    .lean();
};

const getOPDPatientById = async (id) => {
  const Model = getModel("GIRIRAJOpd");
  if (!Model) throw new Error("OPD model not found");

  return await Model.findById(id)
    .populate("consultantDoctorName", "name qualification")
    .lean();
};

const updateOPDPatientById = async (id, update) => {
  const Model = getModel("GIRIRAJOpd");
  if (!Model) throw new Error("OPD model not found");

  const patient = await Model.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, "Patient not found");
  return patient;
};
const deleteOPDPatientById = async (id) => {
  const Model = getModel("GIRIRAJOpd");
  if (!Model) throw new Error("OPD model not found");

  const deleted = await Model.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Patient not found");
  return deleted;
};

async function getOPDPatientByRating() {
  const OPDModel = getModel("GIRIRAJOpd")
  const feedbacks = await OPDModel.find().lean();

  const grouped = {};

  for (const fb of feedbacks) {
    const label = ratingLabels[fb.rating] || 'Unknown';

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push({
      patientName: fb.patientName,
      contact: fb.contact,
      doctorName: fb.doctorName,
      bedNumber: fb.bedNumber,
      department: fb.department,
      date: fb.date,
      comment: fb.comment,
      rating: fb.rating,
    });
  }

  return grouped;
}

const createComplaint = async (data) => {
  return await girirajModels.GIRIRajComplaints?.create(data);
};

const getComplaintById = async (ticketId) => {
  return await girirajModels.GIRIRajComplaints?.findOne({ ticketId }).lean();
};

const updateComplaint = async (ticketId, updates) => {
  return await girirajModels?.GIRIRajComplaints?.findOneAndUpdate({ ticketId }, updates, { new: true });
};

const getAllComplaints = async () => {
  return await girirajModels?.GIRIRajComplaints?.find().lean();
};

async function getComplaintStatsByDepartment() {
  const result = await girirajModels?.GIRIRajComplaints.aggregate([
    {
      $group: {
        _id: '$department',
        totalComplaints: { $sum: 1 },
        totalEscalations: { $sum: '$escalationCount' },
        avgResolution: { $avg: '$resolutionTime' }
      }
    },
    {
      $sort: { totalComplaints: -1 }
    }
  ]);

  return result.map((d, index) => ({
    rank: index + 1,
    department: d._id,
    totalComplaints: d.totalComplaints,
    avgResolution: formatMinutes(d.avgResolution),
    escalations: d.totalEscalations
  }));
}

function formatMinutes(minutes) {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs} HR ${mins} MIN`;
}

const createRole = async (data) => {
  const role = getModel("GIRIRAJRole");
  return await role.create(data);
};

const getAllRoles = async () => {
  const Model = getModel("GIRIRAJRole");

  if (!Model || typeof Model.find !== "function") {
    throw new Error("❌ GIRIRAJRole model not found or invalid");
  }

  return await Model.find().lean();
};

const getRoleById = async (id) => {
  const Model = getModel("GIRIRAJRole");

  if (!Model || typeof Model.findById !== "function") {
    throw new Error("❌ GIRIRAJRole model not found or invalid");
  }

  return await Model.findById(id).lean();
};

const updateRole = async (id, data) => {
  const role = getModel("GIRIRAJRole");
  return await role.findByIdAndUpdate(id, data, { new: true });
};

const deleteRole = async (id) => {
    const role = getModel("GIRIRAJRole");
  return await role.findByIdAndDelete(id);
};

const createRoleUser = async (data) => {
  const {
    name,
    email,
    password,
    roleId,
    loginEnabled = true,
    avatar,
  } = data;

  if (!name || !email || !password || !roleId) {
    throw new Error("Name, email, password, and roleId are required.");
  }
    const roleModel = getModel("GIRIRAJRole");
    const roleUser = getModel("GIRIRAJRoleUser");


  const role = await roleModel.findById(roleId).lean();
  if (!role) {
    throw new Error("Invalid roleId. Role not found.");
  }

  const existingUser = await roleUser.findOne({ email }).lean();
  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await roleUser.create({
    name,
    email,
    password: hashedPassword,
    roleId,
    loginEnabled,
    avatar,
  });

  return newUser;
};

const getAllRoleUsers = async () => {
  const Model = getModel("GIRIRAJRoleUser");

  if (!Model || typeof Model.find !== "function") {
    throw new Error("❌ GIRIRAJRoleUser model not found or invalid");
  }

  return await Model.find()
    .populate("roleId")
    .lean();
};

const getRoleUserById = async (id) => {
  const Model = getModel("GIRIRAJRoleUser");

  if (!Model || typeof Model.findById !== "function") {
    throw new Error("❌ GIRIRAJRoleUser model not found or invalid");
  }

  return await Model.findById(id)
    .populate("roleId")
    .lean();
};

const updateRoleUser = async (id, data) => {
    const roleUser = getModel("GIRIRAJRoleUser");
  return await roleUser.findByIdAndUpdate(id, data, { new: true });
};

const deleteRoleUser = async (id) => {
    const roleUser = getModel("GIRIRAJRoleUser");
  return await roleUser.findByIdAndDelete(id);
};


const forwardConcernToDepartment = async (concernId, department, data, userId) => {
  if (!CONCERN_KEYS.includes(department)) {
    throw new Error("Invalid department name");
  }
  const IPDConcern = getModel("GIRIRAJIPDConcern");

  // ✅ Don't use .lean() here — we need a real Mongoose document
  const concern = await IPDConcern.findById(concernId);
  if (!concern) {
    throw new Error("Concern not found");
  }

  // ✅ Update department data
  concern[department] = { ...data };

  // ✅ Push forward history entry
  concern.forwards = concern.forwards || [];
  concern.forwards.push({
    toDepartment: department,
    note: data.note || "",
    forwardedBy: userId || null,
    forwardedAt: new Date(),
  });

  // ✅ Update status
  concern.status = "forwarded";

  // ✅ Save to DB
  await concern.save();

  // ✅ Extract department name (if function exists)
  const deptName = extractDepartment(concern) || department;

  // ✅ Notify role users
    const roleUser = getModel("GIRIRAJRoleUser");
  
  const roleUsers = await roleUser.find({
    $or: [{ department: deptName }, { departments: { $in: [deptName] } }],
  })
    .populate({ path: "user", select: "fcmTokens" })
    .lean();

  const tokens = [];
  for (const ru of roleUsers) {
    if (ru?.user?.fcmTokens) tokens.push(...ru.user.fcmTokens);
    if (ru?.fcmTokens) tokens.push(...ru.fcmTokens);
  }

  await sendNotification({
    tokens,
    title: "Concern Forwarded",
    body: `New concern from ${concern.patientName || "Patient"} forwarded to ${deptName}`,
    data: {
      concernId: concern._id.toString(),
      complaintId: concern.complaintId || "",
      department: deptName,
      priority: concern.priority,
    },
  });

  return concern;
};


const getConcernsByDepartment = async (department) => {
  if (!CONCERN_KEYS.includes(department)) {
    throw new Error("Invalid department name");
  }

  const IPDConcern = getModel("GIRIRAJIPDConcern");

  return await IPDConcern.find({
    [department]: { $exists: true, $ne: null },
  }).lean().populate("consultantDoctorName");
};

const r1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
const pct = (num, den) => Math.round((Number(num) * 100) / Math.max(1, Number(den)));
function avgFromRatings(ratings = {}, keys = []) {
  const xs = [];
  for (const k of keys) {
    const v = Number(ratings?.[k]);
    if (v >= 1 && v <= 5) xs.push(v);
  }
  if (!xs.length) return 0;
  return r1(xs.reduce((a, b) => a + b, 0) / xs.length);
}
function monthKeyLabel(d) {
  const k = dayjs(d).format("YYYY-MM");
  const label = dayjs(d).format("MMM");
  return { k, label };
}
function parseRange({ from, to } = {}) {
  if (from || to) {
    const end = (to ? dayjs(to) : dayjs()).endOf("day");
    const start = (from ? dayjs(from) : dayjs()).startOf("day");
    return { start: start.toDate(), end: end.toDate() };
  }

  const start = dayjs().startOf("week");
  const end = dayjs().endOf("week");
  return { start: start.toDate(), end: end.toDate() };
}


async function loadFeedbackWindow(range) {
  try {
    const { start, end } = parseRange(range);

    const OpdModel = getActiveModel("GIRIRAJOpd");
    const IpdModel = getActiveModel("GIRIRAJIPDPatients");

    // Fetch both OPD & IPD records
    const [opd, ipd] = await Promise.all([
      OpdModel.find({ createdAt: { $gte: start, $lte: end } })
        .select("patientName contact consultantDoctorName doctorName ratings comments overallRecommendation createdAt")
        .populate("consultantDoctorName", "name qualification")
        .lean(),
      IpdModel.find({ createdAt: { $gte: start, $lte: end } })
        .select("patientName contact consultantDoctorName doctorName ratings comments overallRecommendation createdAt")
        .populate("consultantDoctorName", "name qualification")
        .lean(),
    ]);

    // Merge and sort safely
    const rows = [
      ...opd.map((r) => ({ ...r, source: "OPD" })),
      ...ipd.map((r) => ({ ...r, source: "IPD" })),
    ];

    const sortedRows = rows.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`✅ Loaded ${sortedRows.length} feedback records`);
    return sortedRows;
  } catch (err) {
    console.error("❌ loadFeedbackWindow failed:", err.message);
    return [];
  }
}


// --- helper to normalize doctor info ---
async function normalizeDoctor(value, fallback) {
  if (!value) return { name: fallback || "-", qualification: "" };

  // If value is already populated ObjectId (with doctor fields)
  if (typeof value === "object" && value.name) {
    return { name: value.name, qualification: value.qualification || "" };
  }
  const doctor = getModel("GIRIRAJDoctor");

  // If value is a plain ObjectId (not populated yet)
  if (/^[0-9a-fA-F]{24}$/.test(String(value))) {
    const doc = await doctor.findById(value).lean()
      .select("name qualification")
      .lean();
    return doc ? { name: doc.name, qualification: doc.qualification || "" } : { name: fallback || "-", qualification: "" };
  }

  // If value is a string like "Dr. Patel"
  if (typeof value === "string") {
    return { name: value, qualification: "" };
  }

  return { name: fallback || "-", qualification: "" };
}

// Convert hours → readable format
function formatTAT(hours) {
  if (!hours || hours <= 0) return "—";
  const days = Math.floor(hours / 24);
  const hrs = Math.floor(hours % 24);
  const mins = Math.floor((hours * 60) % 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

// Calculate hours between timestamps
function calcTATHours(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  return (e - s) / (1000 * 60 * 60);
}

// Main KPI function
async function getKpis(range) {
  const { start, end } = parseRange(range);
  const IPDConcern = getModel("GIRIRAJIPDConcern")

  // 1️⃣ Fetch feedbacks in range
  const curr = await loadFeedbackWindow({ from: start, to: end });

  // 2️⃣ Fetch concerns (complaints)
  const concerns = await IPDConcern.find({
    createdAt: { $gte: start, $lte: end },
  })
    .select("status createdAt resolution.resolvedAt")
    .lean();

  const totalConcern = concerns.length;
  const openIssues = concerns.filter((c) =>
    /^(open|partial)$/i.test(c.status)
  ).length;
  const resolvedConcerns = concerns.filter((c) =>
    /^resolved$/i.test(c.status)
  );
  const resolvedIssues = resolvedConcerns.length;

  // 3️⃣ Calculate Avg Resolution Time (TAT)
  const validResolved = resolvedConcerns.filter(
    (c) =>
      c.createdAt &&
      c.resolution?.resolvedAt &&
      new Date(c.resolution.resolvedAt) > new Date(c.createdAt)
  );

  let avgHours = 0;
  if (validResolved.length > 0) {
    const totalHours = validResolved.reduce(
      (sum, c) => sum + calcTATHours(c.createdAt, c.resolution.resolvedAt),
      0
    );
    avgHours = totalHours / validResolved.length;
  }

  const totalResolvedTAT = {
    hours: r1(avgHours),
    display: formatTAT(avgHours),
  };

  // 4️⃣ Compute NPS
  const npsResponses = curr
    .map((r) => r.overallRecommendation)
    .filter((x) => x != null);
  const promoters = npsResponses.filter((x) => x >= 9).length;
  const detractors = npsResponses.filter((x) => x <= 6).length;
  const totalNpsResponses = npsResponses.length;
  const npsPercentage = totalNpsResponses
    ? r1(((promoters - detractors) / totalNpsResponses) * 100)
    : 0;

  // 5️⃣ Build chart data
  const buckets = new Map();
  for (const r of curr) {
    const dKey = dayjs(r.createdAt).format("YYYY-MM-DD");
    if (!buckets.has(dKey)) buckets.set(dKey, { opd: [], ipd: [] });

    if (r.type === "OPD") buckets.get(dKey).opd.push(r.avgRating || 0);
    if (r.type === "IPD") buckets.get(dKey).ipd.push(r.avgRating || 0);
  }

  const labels = [];
  const opdSeries = [];
  const ipdSeries = [];
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, "day");
    const key = d.format("YYYY-MM-DD");
    labels.push(d.format("ddd D"));

    const b = buckets.get(key) || { opd: [], ipd: [] };
    const avgOpd = b.opd.length
      ? r1(b.opd.reduce((s, x) => s + x, 0) / b.opd.length)
      : 0;
    const avgIpd = b.ipd.length
      ? r1(b.ipd.reduce((s, x) => s + x, 0) / b.ipd.length)
      : 0;

    opdSeries.push(avgOpd);
    ipdSeries.push(avgIpd);
  }

  // 6️⃣ Optional: Department-wise avg TAT (for analytics)
  const departments = [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "nursing",
  ];
  const avgTATByDepartment = {};
  for (const dept of departments) {
    const resolvedDept = await IPDConcern.find({
      [`${dept}.status`]: "resolved",
      createdAt: { $gte: start, $lte: end },
    })
      .select("createdAt resolution.resolvedAt")
      .lean();

    if (resolvedDept.length) {
      const totalHours = resolvedDept.reduce(
        (sum, c) => sum + calcTATHours(c.createdAt, c.resolution?.resolvedAt),
        0
      );
      const avgDeptHours = totalHours / resolvedDept.length;
      avgTATByDepartment[dept] = formatTAT(avgDeptHours);
    }
  }

  // 7️⃣ Return KPIs
  return {
    totalFeedback: curr.length,
    averageRating: {
      value: curr.length
        ? r1(curr.reduce((s, r) => s + (r.avgRating || 0), 0) / curr.length)
        : 0,
    },
    npsRating: { value: npsPercentage },
    totalConcern,
    openIssues,
    resolvedIssues,
    totalResolvedTAT, // ✅ New TAT field here
    avgTATByDepartment, // ✅ Optional breakdown
    earning: {
      weeklyAverage: ipdSeries.filter((x) => x > 0).length
        ? r1(
            ipdSeries.reduce((s, x) => s + x, 0) /
              ipdSeries.filter((x) => x > 0).length
          )
        : 0,
      series: ipdSeries,
      labels,
    },
    expense: {
      weeklyAverage: opdSeries.filter((x) => x > 0).length
        ? r1(
            opdSeries.reduce((s, x) => s + x, 0) /
              opdSeries.filter((x) => x > 0).length
          )
        : 0,
      series: opdSeries,
      labels,
    },
  };
}

async function getIpdTrends(range) {
  const { start, end } = parseRange(range);
  const IPDModel = getModel("GIRIRAJIPDPatients")
  const rows = await IPDModel.find({
    createdAt: { $gte: start, $lte: end },
  }).lean()
    .select({ ratings: 1, createdAt: 1 })
    .lean();

  const map = new Map(); // YYYY-MM -> {sum,count,label}
  for (const r of rows) {
    const avg = avgFromRatings(r.ratings, IPD_KEYS);
    const { k, label } = monthKeyLabel(r.createdAt);
    if (!map.has(k)) map.set(k, { sum: 0, count: 0, label });
    const b = map.get(k);
    b.sum += avg;
    b.count += 1;
  }
  const series = Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ date: v.label, value: v.count ? r1(v.sum / v.count) : 0 }));

  const last = series.at(-1)?.value ?? 0;
  const prev = series.at(-2)?.value ?? 0;
  return { series, improvement: r1(last - prev) };
}

async function getOpdSatisfaction(range) {
  const rows = await loadFeedbackWindow(range);
  const only = rows.filter((r) => r.type === "OPD");

  const avg = only.length
    ? r1(only.reduce((s, r) => s + (r.avgRating || 0), 0) / only.length)
    : 0;

  const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of only) {
    const b = Math.min(5, Math.max(1, Math.round(r.avgRating || 0)));
    buckets[b] += 1;
  }
  const total = Math.max(1, only.length);

  return {
    avgRating: avg,
    positivePercent: pct(buckets[5] + buckets[4], total),
    responses: only.length,
    donut: [
      { label: "Excellent", value: buckets[5], percent: pct(buckets[5], total) },
      { label: "Good", value: buckets[4], percent: pct(buckets[4], total) },
      { label: "Average", value: buckets[3], percent: pct(buckets[3], total) },
      { label: "Poor", value: buckets[2], percent: pct(buckets[2], total) },
      { label: "Very Poor", value: buckets[1], percent: pct(buckets[1], total) },
    ],
  };
}

async function getConcerns({ from, to, modules = [], loginType }) {
  const start = from ? new Date(from) : dayjs().startOf("week").toDate();
  const end = to ? new Date(to) : dayjs().endOf("week").toDate();

  const IPDConcern = getModel("GIRIRAJIPDConcern");

  let concerns = [];

  if (loginType?.toLowerCase() === "admin") {
    // ✅ Fetch all concerns (ignore date range)
    concerns = await IPDConcern.find({}).lean()
      .select("complaintId status")
      .lean();

    const normalizeStatus = (s) => {
      if (!s) return "Open";
      const lower = String(s).toLowerCase();
      if (lower === "resolved") return "Resolved";
      if (lower === "in_progress" || lower === "in progress") return "In Progress";
      return "Open";
    };

    const counts = { Open: 0, "In Progress": 0, Resolved: 0 };
    concerns.forEach((c) => {
      const status = normalizeStatus(c.status);
      counts[status] = (counts[status] || 0) + 1;
    });

    return [
      {
        weekLabel: `${dayjs(start).format("D MMM")} - ${dayjs(end).format("D MMM")}`,
        countsByModule: { all: counts }, // ✅ show breakdown for admin
        total: concerns.length,
      },
    ];
  }

  // ✅ For non-admin: respect date filter & module breakdown
  concerns = await IPDConcern.find({
    createdAt: { $gte: start, $lte: end },
  }).lean()
    .select(
      "complaintId status doctorServices billingServices housekeeping maintenance diagnosticServices dietitianServices security nursing"
    )
    .lean();

  const normalizeStatus = (s) => {
    if (!s) return "Open";
    const lower = String(s).toLowerCase();
    if (lower === "resolved") return "Resolved";
    if (lower === "in_progress" || lower === "in progress") return "In Progress";
    return "Open";
  };

  let countsByModule = {};
  let total = 0;

  const complaintMap = {};
  for (const c of concerns) {
    const complaintId = c.complaintId;
    const status = normalizeStatus(c.status);

    if (!complaintMap[complaintId]) {
      complaintMap[complaintId] = { modules: new Set(), status };
    }

    if (c.doctorServices) complaintMap[complaintId].modules.add("doctor_service");
    if (c.billingServices) complaintMap[complaintId].modules.add("billing_service");
    if (c.housekeeping) complaintMap[complaintId].modules.add("housekeeping");
    if (c.maintenance) complaintMap[complaintId].modules.add("maintenance");
    if (c.diagnosticServices) complaintMap[complaintId].modules.add("diagnostic_service");
    if (c.dietitianServices) complaintMap[complaintId].modules.add("dietetics");
    if (c.security) complaintMap[complaintId].modules.add("security");
    if (c.nursing) complaintMap[complaintId].modules.add("nursing");

    complaintMap[complaintId].status = status;
  }

  // Init counters
  for (const mod of modules) {
    countsByModule[mod] = { Open: 0, "In Progress": 0, Resolved: 0 };
  }

  // Count per module
  for (const { modules: modSet, status } of Object.values(complaintMap)) {
    const intersection = [...modSet].filter((m) => modules.includes(m));
    if (intersection.length > 0) {
      total += 1;
      intersection.forEach((m) => {
        countsByModule[m][status] += 1;
      });
    }
  }

  return [
    {
      weekLabel: `${dayjs(start).format("D MMM")} - ${dayjs(end).format("D MMM")}`,
      countsByModule,
      total,
    },
  ];
}

async function getDepartmentAnalysis(range) {
  const { start, end } = parseRange(range);
  const IPDConcern = getModel("GIRIRAJIPDConcern");

  // --- 1️⃣ Fetch complaints (with fallback department extraction)
  const rawComplaints = await IPDConcern
    ?.find({ createdAt: { $gte: start, $lte: end } }).lean()
    .select("department status resolutionTime doctorServices billingServices housekeeping maintenance diagnosticServices dietitianServices security nursing")
    .lean() || [];

  // --- 2️⃣ Normalize complaint departments properly
  const complaints = [];
  for (const c of rawComplaints) {
    let dept = c.department?.trim();

    // If department field is missing, infer from which service field is filled
    if (!dept) {
      const possibleDeps = Object.keys(DEPT_LABEL);
      for (const key of possibleDeps) {
        if (c[key] && (c[key].text || (c[key].attachments?.length > 0))) {
          dept = DEPT_LABEL[key];
          break;
        }
      }
    }

    complaints.push({
      department: dept || "Unknown",
      status: c.status?.toLowerCase() || "open",
      resolutionTime: c.resolutionTime || 0,
    });
  }

  // --- 3️⃣ Aggregate manually by department
  const compByDept = {};
  for (const c of complaints) {
    if (!compByDept[c.department]) {
      compByDept[c.department] = {
        concerns: 0,
        resolved: 0,
        pending: 0,
        totalResolution: 0,
        totalResolved: 0,
      };
    }

    const agg = compByDept[c.department];
    agg.concerns += 1;
    if (c.status === "resolved") {
      agg.resolved += 1;
      agg.totalResolved += 1;
      agg.totalResolution += c.resolutionTime;
    } else if (["open", "in_progress"].includes(c.status)) {
      agg.pending += 1;
    }
  }

  // --- 4️⃣ Get average resolution time per department
  for (const dept in compByDept) {
    const d = compByDept[dept];
    d.avgResolution = d.totalResolved > 0 ? d.totalResolution / d.totalResolved : 0;
  }

  // --- 5️⃣ Fetch feedback ratings (for satisfaction)
  const rows = (await loadFeedbackWindow(range)) || [];

  const ratingAgg = {}; // deptName -> {sum,count}
  for (const r of rows) {
    const ratings = r?.ratings || {};
    for (const key of Object.keys(DEPT_LABELS)) {
      const deptLabel = DEPT_LABELS[key]; // e.g. "Housekeeping"
      const v = Number(ratings[key]);
      if (v >= 1 && v <= 5) {
        if (!ratingAgg[deptLabel]) ratingAgg[deptLabel] = { sum: 0, count: 0 };
        ratingAgg[deptLabel].sum += v;
        ratingAgg[deptLabel].count += 1;
      }
    }
  }

  // --- 6️⃣ Merge complaint + feedback data
  const allDepts = new Set([
    ...Object.keys(compByDept),
    ...Object.keys(ratingAgg),
  ]);

  const result = [];
  for (const department of allDepts) {
    const c = compByDept[department] || {};
    const r = ratingAgg[department];
    const avgRating = r ? r1(r.sum / Math.max(1, r.count)) : 0;

    const concerns = c.concerns || 0;
    const resolved = c.resolved || 0;
    const pending = c.pending || Math.max(0, concerns - resolved);
    const workload =
      pending >= 10 ? "High" : pending >= 5 ? "Medium" : "Low";

    result.push({
      department: department || "Unknown",
      concerns,
      resolved,
      pending,
      avgTime: formatMinutes(c.avgResolution || 0),
      satisfaction: Math.round((avgRating / 5) * 100),
      value: avgRating,
      workload,
    });
  }

  // --- 7️⃣ Sort and return
  return result.sort((a, b) => a.department.localeCompare(b.department));
}

async function getRecentFeedbacks(range, limit = 6) {
  const rows = await loadFeedbackWindow(range);

  return rows.slice(0, limit).map((r) => ({
    type: r.type,
    patientName: r.patientName,
    contact: r.contact,
    doctor: r.consultantDoctorName?.name || "-",   // ✅ safe
    qualification: r.consultantDoctorName?.qualification || "", // ✅ safe
    rating: r1(r.avgRating),
    comment: r.comments || "",
    createdAt: r.createdAt,
  }));
}


async function getDailyFeedback(range) {
  const { start, end } = parseRange(range);

  // models (with safe fallbacks just in case the exact casing differs)
  const IPDModel = getModel("GIRIRAJIPDPatients");

  const OPDModel = getModel("GIRIRAJOpds");

  const [ipdRows, opdRows] = await Promise.all([
    IPDModel
      ? IPDModel.find({ createdAt: { $gte: start, $lte: end } })
        .select({ ratings: 1, createdAt: 1 })
        .lean()
      : [],
    OPDModel
      ? OPDModel.find({ createdAt: { $gte: start, $lte: end } })
        .select({ ratings: 1, createdAt: 1 })
        .lean()
      : [],
  ]);

  // YYYY-MM-DD -> {opd:[], ipd:[]}
  const buckets = {};

  const pushAvg = (arr, key) => {
    const k = dayjs(key).format("YYYY-MM-DD");
    if (!buckets[k]) buckets[k] = { opd: [], ipd: [] };
    return buckets[k];
  };

  // IPD: use IPD_KEYS
  for (const r of ipdRows) {
    const avgIpd = avgFromRatings(r?.ratings || {}, IPD_KEYS) || 0;
    pushAvg(ipdRows, r.createdAt).ipd.push(avgIpd);
  }

  // OPD: use OPD_KEYS
  for (const r of opdRows) {
    const avgOpd = avgFromRatings(r?.ratings || {}, OPD_KEYS) || 0;
    pushAvg(opdRows, r.createdAt).opd.push(avgOpd);
  }

  // Build series for entire month till today
  const today = dayjs();
  const startOfMonth = today.startOf("month");
  const daysInMonth = today.date(); // only up to current day

  const labels = [];
  const opdSeries = [];
  const ipdSeries = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const d = startOfMonth.date(i);
    const key = d.format("YYYY-MM-DD");
    labels.push(d.format("D MMM"));

    const b = buckets[key] || { opd: [], ipd: [] };
    const avgOpd = b.opd.length ? r1(b.opd.reduce((s, x) => s + x, 0) / b.opd.length) : 0;
    const avgIpd = b.ipd.length ? r1(b.ipd.reduce((s, x) => s + x, 0) / b.ipd.length) : 0;

    opdSeries.push(avgOpd);
    ipdSeries.push(avgIpd);
  }

  return {
    labels,
    opdSeries,
    ipdSeries,
    today: {
      opd: opdSeries.at(-1) ?? 0,
      ipd: ipdSeries.at(-1) ?? 0,
    },
    yesterday: {
      opd: opdSeries.at(-2) ?? 0,
      ipd: ipdSeries.at(-2) ?? 0,
    },
  };
}


// ✅ Calculate total user counts and total resolved concerns (TAT)
async function getExtraStats() {
  const user = getModel("GIRIRAJUser");
  const roleUser = getModel("GIRIRAJRoleUser");
  // ---- 1️⃣ Count users ----
  const totalUsers = await user.countDocuments({});
  const totalRoleUsers = await roleUser.countDocuments({});

  // If admins are also in GIRIRAJUser collection with loginType: 'admin'
  const totalAdmins = await user.countDocuments({
    loginType: { $regex: /^admin$/i },
  });

  // ---- 2️⃣ Count Resolved Concerns (TAT) ----
  const totalTAT = await roleUser.countDocuments({
    status: { $in: ["Resolved", "resolved"] },
  });

  return {
    totalUsers,
    totalRoleUsers,
    totalAdmins,
    totalTAT, // ✅ total resolved concerns
  };
}

async function getDashboard({ from, to, modules = [], loginType }) {
  const [kpis, ipdTrends, opdSatisfaction, concerns, dept, recent, daily, extra] =
    await Promise.all([
      getKpis({ from, to }),
      getIpdTrends({ from, to }),
      getOpdSatisfaction({ from, to }),
      getConcerns({ from, to, modules, loginType }),
      getDepartmentAnalysis({ from, to, modules, loginType }),
      getRecentFeedbacks({ from, to }, 6),
      getDailyFeedback({ from, to }),
      getExtraStats(),
    ]);

  const isAdmin = loginType?.toLowerCase() === "admin";

  return {
    kpis,
    ipdTrends,
    opdSatisfaction,
    concerns,
    departmentAnalysis: dept,
    recentFeedbacks: recent,
    dailyFeedback: daily,
    ...(isAdmin ? { totals: extra } : {}), // ✅ only include totals for admin
  };
}


const escalateConcern = async (concernId, { level, note, userId }) => {
  const IPDConcern = getModel("GIRIRAJIPDConcern");
  const concern = await IPDConcern.findById(concernId);
  if (!concern) throw new Error("Concern not found");

  // 🧭 Static mapping (as per your fixed users)
  const ESCALATION_USER_MAP = {
    PGRO: null,
    CEO: "68ef88c724a8a2a8317e0cb3", // Jalpa Raichura
    "Board of Directors": "68ef884624a8a2a8317e0cab", // Mayank Thakkar
    "Medical Director": "68ef88b124a8a2a8317e0caf", // Shivani Kathrotiya
  };

  const targetUserId = ESCALATION_USER_MAP[level];

  // 🟢 Create escalation record (no `toUser` field)
  const escalation = {
    level,
    note,
    escalatedBy: userId,
    escalatedAt: new Date(),
  };

  concern.escalations.push(escalation);
  concern.status = "escalated";
  await concern.save();
  const user = getModel("GIRIRAJUser");

  // 🟣 If mapped user found, send FCM notification
  if (targetUserId) {
    const targetUser = await user.findById(targetUserId)
      .select("name fcmTokens email")
      .lean();

    if (targetUser?.fcmTokens?.length > 0) {
      await sendNotification({
        tokens: targetUser.fcmTokens,
        title: `⚠️ Complaint Escalated to ${level}`,
        body: `Patient ${concern.patientName || "N/A"}'s complaint has been escalated.`,
        data: {
          concernId: String(concern._id),
          level,
          type: "IPD_CONCERN_ESCALATED",
        },
      });
    }
  }

  return {
    success: true,
    message: `Complaint escalated to ${level}`,
    data: concern,
  };
};

// Calculate final complaint status based ONLY on active departments
function calculateComplaintStatus(complaint) {
  const modules = complaint.modules; // All mapped departments

  // Active = has text or attachments
  const activeModules = modules.filter((m) => {
    const sec = complaint[m];
    if (!sec) return false;
    const hasText = sec.text?.trim()?.length > 0;
    const hasFiles = Array.isArray(sec.attachments) && sec.attachments.length > 0;
    return hasText || hasFiles;
  });

  if (activeModules.length === 0) return "partial"; // no valid department

  // Check if ALL are resolved or admin resolved
  const allResolved = activeModules.every((m) => {
    const sec = complaint[m];
    return (
      sec.status === "resolved" ||
      sec.status === "resolved_by_admin"
    );
  });

  return allResolved ? "resolved" : "partial";
}


async function resolveConcern(
  complaintId,
  { department, actionType = "resolved", note = "", proof = null, userId }
) {
  const ComplaintModel = getModel("GIRIRAJIPDConcern");

  // ⭐ Fix: Convert null proof → []
  if (!Array.isArray(proof)) proof = [];

  const complaint = await ComplaintModel.findById(complaintId);
  if (!complaint) throw new Error("Complaint not found");

  // ⭐ Fix: If department is array → take first
  if (Array.isArray(department)) {
    department = department[0];
  }

  // ⭐ Fix: Auto-select department if only 1 department exists
  if (!department) {
    if (Array.isArray(complaint.modules) && complaint.modules.length === 1) {
      department = complaint.modules[0];
    } else {
      throw new Error("Department is required");
    }
  }

  // ⭐ Fix: Backend should NOT crash even if department key missing — create it
  if (!complaint[department]) {
    complaint[department] = {
      text: "",
      attachments: [],
      status: "open",
      actionType: "",
      actionNote: "",
      resolution: null,
      forward: null,
      progress: null,
      escalation: null
    };
  }

  const section = complaint[department];
  if (!section) throw new Error(`Invalid department: ${department}`);

  // ⭐ RESOLUTION UPDATE
  section.status = "resolved";
  section.actionType = actionType || "resolved";  // always available
  section.actionNote = note;

  section.resolution = {
    note,
    proof,
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolvedType: "staff"
  };

  // ⭐ Update main complaint status
  complaint.status = calculateComplaintStatus(complaint);

  await complaint.save();

  return {
    success: true,
    message:
      complaint.status === "resolved"
        ? "Complaint fully resolved."
        : `Department ${department} resolved. Complaint partially open.`,
    complaint
  };
}


function hasValidData(deptData) {
  if (!deptData) return false;

  const obj = deptData.toObject ? deptData.toObject() : deptData;

    const hasText = obj.text && obj.text.trim() !== "";
  const hasAttachments = Array.isArray(obj.attachments) && obj.attachments.length > 0;

  return hasText || hasAttachments;
}

const getConcernHistory = async (concernId) => {
  const IPDConcern = getModel("GIRIRAJIPDConcern");
  // 1️⃣ Fetch concern with full populated references
  const concernDoc = await IPDConcern.findById(concernId)
    .populate("escalations.escalatedBy", "name email")
    .populate("resolution.resolvedBy", "name email")
    .populate("forwards.forwardedBy", "name email")
    .populate("progress.updatedBy", "name email");

  if (!concernDoc) throw new Error("Concern not found");

  const concern = concernDoc.toObject();
  const history = [];
  const forwardedDepartments = [];

  // 2️⃣ Complaint Created
  history.push({
    type: "created",
    label: "Complaint Created",
    status: concern.status,
    at: concern.createdAt,
    details: {
      patientName: concern.patientName,
      complaintId: concern.complaintId,
    },
  });

  // 3️⃣ Global Forwards
  if (Array.isArray(concern.forwards) && concern.forwards.length > 0) {
    concern.forwards.forEach((fwd) => {
      forwardedDepartments.push(fwd.toDepartment);
      history.push({
        type: "forwarded",
        label: `Complaint Forwarded to ${fwd.toDepartment}`,
        note: fwd.note || fwd.text || "",
        by: fwd.forwardedBy || null,
        at: fwd.forwardedAt || concern.updatedAt,
      });
    });
  }

  // 4️⃣ Global Escalations
  if (Array.isArray(concern.escalations) && concern.escalations.length > 0) {
    concern.escalations.forEach((esc) => {
      history.push({
        type: "escalated",
        label: `Complaint Escalated to ${esc.level || "Higher Authority"}`,
        note: esc.note || esc.text || "",
        level: esc.level || null,
        by: esc.escalatedBy || null,
        at: esc.escalatedAt || concern.updatedAt,
      });
    });
  }

  // 5️⃣ Global In-Progress
  if (concern.progress && (concern.progress.note || concern.progress.text)) {
    history.push({
      type: "in_progress",
      label: "Complaint marked In-Progress",
      note: concern.progress.note || concern.progress.text || "",
      by: concern.progress.updatedBy || null,
      at: concern.progress.updatedAt || concern.updatedAt,
    });
  }

  // 6️⃣ Global Resolution
  if (concern.resolution && (concern.resolution.note || concern.resolution.text)) {
    history.push({
      type: "resolved",
      label: "Complaint Resolved",
      note: concern.resolution.note || concern.resolution.text || "",
      proof: concern.resolution.proof || [],
      by: concern.resolution.resolvedBy || null,
      at: concern.resolution.resolvedAt || concern.updatedAt,
    });
  }

  // -------------------------------------------------
  // 7️⃣ Department-level (Partial) events
  // -------------------------------------------------
  const DEPT_KEYS = [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "nursing",
  ];

  for (const dept of DEPT_KEYS) {
    const block = concern[dept];
    if (!block) continue;

    const baseNote =
      block.progress?.note ||
      block.escalation?.note ||
      block.resolution?.note ||
      block.note ||
      block.text ||
      "";

    // 🟡 Partial In-Progress
    if (block.status === "in_progress") {
      history.push({
        type: "in_progress",
        label: `Department (${dept}) marked In-Progress`,
        note: baseNote,
        by: block.progress?.updatedBy || null,
        at: block.progress?.updatedAt || concern.updatedAt,
        department: dept,
      });
    }

    // 🔴 Partial Escalated
    if (block.status === "escalated") {
      const escalateNote =
        block.escalation?.note ||
        block.escalation?.text ||
        block.note ||
        block.text ||
        "";

      history.push({
        type: "escalated",
        label: `Department (${dept}) Escalated${block.escalation?.level ? ` to ${block.escalation.level}` : ""
          }`,
        note: escalateNote, // ✅ display the real note written during escalation
        level: block.escalation?.level || null,
        by: block.escalation?.escalatedBy || null,
        at: block.escalation?.escalatedAt || concern.updatedAt,
        department: dept,
      });
    }


    // 🟢 Partial Resolved
    if (block.status === "resolved") {
      history.push({
        type: "resolved",
        label: `Department (${dept}) Resolved`,
        note: baseNote,
        proof: block.resolution?.proof || [],
        by: block.resolution?.resolvedBy || null,
        at: block.resolution?.resolvedAt || concern.updatedAt,
        department: dept,
      });
    }

    // 🟣 Partial Forwarded
    if (block.status === "forwarded") {
      history.push({
        type: "forwarded",
        label: `Department (${dept}) Forwarded`,
        note: baseNote,
        by: block.forwardedBy || null,
        at: block.forwardedAt || concern.updatedAt,
        department: dept,
      });
    }
  }

  // -------------------------------------------------
  // 8️⃣ Sort all history chronologically
  // -------------------------------------------------
  const timeline = history.sort(
    (a, b) => new Date(a.at || a.createdAt) - new Date(b.at || b.createdAt)
  );

  // -------------------------------------------------
  // 9️⃣ Return formatted response
  // -------------------------------------------------
  return {
    concernId: concern._id,
    forwardedDepartments,
    timeline,
  };
};

const updateProgressRemarkService = async (complaintId, updateNote, userId) => {
  const ConcernModel = getModel("GIRIRAJIPDConcern");
  const RoleUserModel = getModel("GIRIRAJRoleUser");

  if (!ConcernModel || typeof ConcernModel.findOneAndUpdate !== "function") {
    throw new Error("❌ GIRIRAJIPDConcern model not found or invalid");
  }

  if (!RoleUserModel || typeof RoleUserModel.find !== "function") {
    throw new Error("❌ GIRIRAJRoleUser model not found or invalid");
  }

  // 🔹 Update complaint progress
  const updatedConcern = await ConcernModel.findOneAndUpdate(
    { complaintId },
    {
      $set: {
        note: updateNote,
        status: "in_progress",
        progress: {
          note: updateNote,
          updatedBy: userId || null,
          updatedAt: new Date(),
        },
      },
    },
    { new: true }
  )
    .populate("progress.updatedBy", "name email")
    .lean();

  if (!updatedConcern) throw new Error("Concern not found");

  // 🔹 Fetch Admin department users
  const deptUsers = await RoleUserModel.find({
    $or: [{ department: "Admin" }, { departments: { $in: ["Admin"] } }],
  })
    .populate({ path: "user", select: "fcmTokens name" })
    .lean();

  // 🔹 Collect FCM tokens
  const tokens = [];
  for (const du of deptUsers) {
    if (du?.user?.fcmTokens) tokens.push(...du.user.fcmTokens);
    if (du?.fcmTokens) tokens.push(...du.fcmTokens);
  }

  // 🔹 Send Notification (if tokens found)
  if (tokens.length > 0) {
    await sendNotification({
      tokens,
      title: "Progress Updated",
      body: `Concern ${updatedConcern.complaintId} marked In-Progress: ${updateNote}`,
      data: {
        concernId: updatedConcern._id?.toString(),
        complaintId: updatedConcern.complaintId,
        status: updatedConcern.status,
      },
    });
  }

  return updatedConcern;
};


const createDoctor = async (payload) => {
  const doctor = getModel("GIRIRAJDoctor");
  return await doctor.create(payload);
};

const getDoctors = async () => {
  const Model = getModel("GIRIRAJDoctor");

  if (!Model || typeof Model.find !== "function") {
    throw new Error("❌ GIRIRAJDoctor model not found or invalid");
  }

  return await Model.find()
    .sort({ createdAt: -1 })
    .lean();
};

const getDoctorById = async (id) => {
  const Model = getModel("GIRIRAJDoctor");

  if (!Model || typeof Model.findById !== "function") {
    throw new Error("❌ GIRIRAJDoctor model not found or invalid");
  }

  return await Model.findById(id).lean();
};

 
const deleteDoctor = async (id) => {
  const doctor = getModel("GIRIRAJDoctor");
  return await doctor.findByIdAndDelete(id);
}

const updateDoctor = async (id, update) => {
  const doctor = getModel("GIRIRAJDoctor");
  const patient = await doctor.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

const sendAndSaveNotification = async ({ tokens, title, body, data = {}, role, sentTo = [] }) => {
  try {
    if (!tokens || tokens.length === 0) {

      return { success: false, error: "No tokens" };
    }

    const message = {
      tokens,
      notification: { title, body },
      data,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    const notification = getModel("GIRIRAJNotification");

    // ✅ Save into DB
    const savedNotification = await notification.create({
      title,
      body,
      data,
      role,
      sentTo,
    });

    console.log("Notification sent & saved:", savedNotification._id);
    return { success: true, response, savedNotification };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
};

 const getAllNotificationsService = async () => {
  try {
    // ✅ Always get the active DB models
    const Notification = getActiveModel("GIRIRAJNotification");
    const IPDConcern = getActiveModel("GIRIRAJIPDConcern");

    // 1️⃣ Fetch notifications
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .lean();

    if (!notifications.length) {
      console.log("⚠️ No notifications found.");
      return [];
    }

    // 2️⃣ Collect complaint IDs from notification data
    const complaintIds = notifications
      .map((n) => n?.data?.complaintId)
      .filter(Boolean);

    // 3️⃣ Fetch complaints related to those IDs
    const complaints = await IPDConcern.find({ _id: { $in: complaintIds } })
      .select("status bedNo patientName")
      .lean();

    // Create a lookup map for fast matching
    const complaintMap = {};
    for (const c of complaints) {
      complaintMap[c._id.toString()] = c;
    }

    // 4️⃣ Merge complaint details into notifications
    const enrichedNotifications = notifications.map((n) => {
      const complaint = n?.data?.complaintId
        ? complaintMap[n.data.complaintId]
        : null;

      return {
        ...n,
        data: {
          ...n.data,
          bedNo: complaint?.bedNo || n.data?.bedNo || "-",
          patientName: complaint?.patientName || n.data?.patientName || "Unknown",
          status: complaint?.status || n.data?.status || "Pending",
        },
      };
    });

    console.log(`✅ Enriched ${enrichedNotifications.length} notifications.`);
    return enrichedNotifications;
  } catch (error) {
    console.error("❌ Error fetching enriched notifications:", error);
    return [];
  }
};

async function getAllComplaintDetails(useBackup = false) {
  // 🧠 1️⃣ Use the safe getModel helper (case-insensitive)
  let Model = getModel("GIRIRAJIPDConcern");

  // 🧩 2️⃣ Unwrap if wrapped (common case: { primary, secondary })
  if (Model && typeof Model.find !== "function") {
    Model = useBackup ? Model.secondary : Model.primary;
  }

  // 🧩 3️⃣ Validate that it’s a real Mongoose model
  if (!Model || typeof Model.find !== "function") {
    console.error("❌ Invalid or missing model for GIRIRAJIPDConcern:", Model);
    throw new Error("GIRIRAJIPDConcern model not found or invalid");
  }

  // ✅ 4️⃣ Safe query chain (populate + lean)
  const concerns = await Model.find()
    .populate("consultantDoctorName", "name")
    .populate("resolution.resolvedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const resolvedConcerns = concerns.filter((c) => c.resolution?.resolvedAt);

  return resolvedConcerns.map((concern) => {
    const departments = [];
    Object.keys(DEPT_LABEL).forEach((dep) => {
      if (
        concern[dep] &&
        (concern[dep].text || (concern[dep].attachments?.length > 0))
      ) {
        departments.push({
          department: DEPT_LABEL[dep] || dep,
          text: concern[dep].text || null,
          attachments: concern[dep].attachments || [],
        });
      }
    });

    // ✅ Calculate TAT
    let totalTime = null;
    if (concern.resolution?.resolvedAt && concern.createdAt) {
      const diffMs =
        new Date(concern.resolution.resolvedAt) - new Date(concern.createdAt);
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(
        (diffMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      totalTime = `${diffHours}h ${diffMinutes}m`;
    }

    return {
      _id: concern._id,
      complaintId: concern.complaintId,
      patientName: concern.patientName,
      contact: concern.contact || "-",
      bedNo: concern.bedNo || "-",
      doctor: concern.consultantDoctorName?.name || "-",
      status: concern.status,
      priority: concern.priority,
      note: concern.note || "-",
      stampIn: concern.createdAt,
      stampOut: concern.resolution?.resolvedAt,
      totalTimeTaken: totalTime,
      departments,
      resolution: {
        note: concern.resolution?.note || null,
        proof: concern.resolution?.proof || [],
        resolvedBy: concern.resolution?.resolvedBy?.name || "-",
      },
    };
  });
}

const createBed = async (payload) => {
  const bed = getModel("GIRIRAJBed");
  return await bed.create(payload);
};

const getBeds = async () => {
  const Model = getModel("GIRIRAJBed");

  if (!Model || typeof Model.find !== "function") {
    throw new Error("❌ GIRIRAJBed model not found or invalid");
  }

  return await Model.find()
    .sort({ createdAt: -1 })
    .lean();
};

const getBedById = async (id) => {
  const Model = getModel("GIRIRAJBed");

  if (!Model || typeof Model.findById !== "function") {
    throw new Error("❌ GIRIRAJBed model not found or invalid");
  }

  return await Model.findById(id).lean();
};

const deleteBed = async (id) => {
  const bed = getModel("GIRIRAJBed");
  return await bed.findByIdAndDelete(id);
}

const updatedBed = async (id, update) => {
  const bed = getModel("GIRIRAJBed");
  const patient = await bed.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

const validateBedNumber = async (bedNo) => {
  const num = Number(bedNo);

  if (!num || isNaN(num)) {
    return { valid: false, message: "Invalid bed number" };
  }

  const BedModel = getModel("GIRIRAJBed");
  if (!BedModel) {
    return { valid: false, message: "Bed model not loaded" };
  }

  const bedWard = await BedModel.findOne({
    start: { $lte: num },
    end: { $gte: num },
  }).lean();

  if (!bedWard) {
    return { valid: false, message: "This bed number does not exist in any ward" };
  }
  
  return { valid: true, ward: bedWard.wardName, bedRange: `${bedWard.start}-${bedWard.end}` };
};

const getComplaintSummary = async (useBackup = false) => {
  try {
    const IPDConcern = getModel("GIRIRAJIPDConcern");
  const bed = getModel("GIRIRAJBed");
    
    // 🧠 Load models from global registry (dual DB safe)
    let ComplaintModel = IPDConcern;
    let BedModel = bed;

    // ✅ Handle dual-model wrappers ({ primary, secondary })
    if (ComplaintModel && typeof ComplaintModel.find !== "function") {
      ComplaintModel = useBackup ? ComplaintModel.secondary : ComplaintModel.primary;
    }
    if (BedModel && typeof BedModel.find !== "function") {
      BedModel = useBackup ? BedModel.secondary : BedModel.primary;
    }

    // ❌ Safety check
    if (!ComplaintModel || typeof ComplaintModel.find !== "function") {
      throw new Error("Invalid GIRIRAJIPDConcern model");
    }
    if (!BedModel || typeof BedModel.find !== "function") {
      throw new Error("Invalid GIRIRAJBed model");
    }

    // ✅ Queries
    const complaints = await ComplaintModel.find().lean();
    const beds = await BedModel.find().lean();

    const wardCounts = {};

    complaints.forEach((c) => {
      const bedNo = parseInt(c.bedNo, 10);
      if (!bedNo || isNaN(bedNo)) return;

      const ward = beds.find((b) => bedNo >= b.start && bedNo <= b.end);
      if (ward) {
        wardCounts[ward.wardName] = (wardCounts[ward.wardName] || 0) + 1;
      } else {
        wardCounts["Unassigned"] = (wardCounts["Unassigned"] || 0) + 1;
      }
    });

    return Object.entries(wardCounts).map(([ward, count]) => ({
      ward,
      count,
    }));
  } catch (err) {
    console.error("❌ Error in complaintSummary:", err.message);
    throw err;
  }
};


async function getServiceWiseSummary() {
  const IPDModel = getModel("GIRIRAJIPDConcern");
  const complaints = await IPDModel.find({}).lean();

  const serviceCounts = {
    doctor_service: 0,
    billing_service: 0,
    housekeeping: 0,
    maintenance: 0,
    diagnostic_service: 0,
    dietetics: 0,
    security: 0,
    nursing: 0
  };

  complaints.forEach((c) => {
    if (c.doctorServices) serviceCounts.doctor_service++;
    if (c.billingServices) serviceCounts.billing_service++;
    if (c.housekeeping) serviceCounts.housekeeping++;
    if (c.maintenance) serviceCounts.maintenance++;
    if (c.diagnosticServices) serviceCounts.diagnostic_service++;
    if (c.dietitianServices) serviceCounts.dietetics++;
    if (c.security) serviceCounts.security++;
    if (c.nursing) serviceCounts.nursing++;
  });

  // Format response with clean labels
  const formatted = Object.entries(serviceCounts)
    .filter(([_, count]) => count > 0)
    .map(([service, count]) => ({
      service: SERVICE_LABELS[service] || service, // Map to clean label
      count
    }));

  return formatted;
}

async function getFrequentRatingKeywords(limit = 6) {
  const IPDModel = getModel("GIRIRAJIPDPatients");
  const patients = await IPDModel.find({}, { ratings: 1 }).lean();

  const counts = {};

  patients.forEach((p) => {
    if (!p.ratings) return;
    Object.entries(p.ratings).forEach(([field, value]) => {
      if (!value) return; // skip if no rating
      const label = RATING_LABELS[field] || field;
      counts[label] = (counts[label] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1]) // sort by frequency
    .slice(0, limit)             // only top N
    .map(([label]) => label);    // return labels only
}


const getFrequentOPDRatings = async () => {
  // All rating keys in schema
  const ratingKeys = [
    "appointment",
    "receptionStaff",
    "radiologyDiagnosticServices",
    "pathologyDiagnosticServices",
    "doctorServices",
    "security",
    "cleanliness",
  ];

  // Initialize counts
  const counts = {};
  ratingKeys.forEach((k) => (counts[k] = 0));
  const OPDModel = getModel("GIRIRAJOpd")

  // Fetch all OPD feedback
  const feedbacks = await OPDModel.find({}, { ratings: 1 }).lean();

  feedbacks.forEach((fb) => {
    if (!fb.ratings) return;
    for (const key of ratingKeys) {
      const val = fb.ratings[key];
      if (typeof val === "number" && val >= 1 && val <= 5) {
        counts[key] += 1;
      }
    }
  });

  // Sort descending by usage
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  // Convert key -> human-readable label
  const prettyKey = (k) =>
    k
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());

  const keywords = sorted
    .filter(([, count]) => count > 0) // only keep used
    .map(([key]) => prettyKey(key));

  return keywords;
};

async function partialResolveConcern(
  complaintId,
  { department, note = "", proof = [], userId }
) {
  const ComplaintModel = getModel("GIRIRAJIPDConcern");

  const complaint = await ComplaintModel.findById(complaintId);
  if (!complaint) throw new Error("Complaint not found");

  // ⭐ FIX — If department missing or array, auto-detect correct department
  if (!department || Array.isArray(department)) {
    if (Array.isArray(department)) department = department[0];

    // If only ONE department exists → auto assign
    if (!department && complaint.modules?.length === 1) {
      department = complaint.modules[0];
    }
  }

  if (!department) {
    throw new Error("Department is required and could not be auto-detected");
  }

  const section = complaint[department];
  if (!section) throw new Error(`Invalid department: ${department}`);

  section.status = "resolved";
  section.resolution = {
    note,
    proof,
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolvedType: "staff"
  };

  // ⭐ Recalculate overall complaint status
  complaint.status = calculateComplaintStatus(complaint);

  await complaint.save();

  return {
    success: true,
    message:
      complaint.status === "resolved"
        ? "All departments resolved."
        : `Department ${department} resolved. Complaint partially open.`,
    complaint
  };
}




const partialInProgressConcern = async (concernId, { department, note, userId }) => {
  const IPDConcern = getModel("GIRIRAJIPDConcern");
  let concern = await IPDConcern.findById(concernId);
  if (!concern) {
    concern = await IPDConcern.findOne({ complaintId: concernId });
  }
  if (!concern) throw new Error("Concern not found");
  if (!department) throw new Error("Department is required");

  // Set department block
  concern[department] = concern[department] || {};
  concern[department].status = "in_progress";
  concern[department].progress = {
    note: note || "",
    updatedBy: userId || null,
    updatedAt: new Date(),
  };

  // ✅ complaint always "in_progress"
  concern.status = "in_progress";
  concern.updatedAt = new Date();
  await concern.save();

  return {
    success: true,
    message: `${department} marked as in progress`,
    data: {
      _id: concern._id,
      status: "in_progress",
      department,
      note,
    },
  };
};

const partialEscalateConcern = async (concernId, { department, note, level, userId }) => {
  let concern = null;
  const IPDConcern = getModel("GIRIRAJIPDConcern");

  // 🔹 Find concern by ID or complaintId
  if (mongoose.Types.ObjectId.isValid(concernId)) {
    concern = await IPDConcern.findById(concernId);
  }
  if (!concern) {
    concern = await IPDConcern.findOne({ complaintId: concernId });
  }

  if (!concern) throw new Error("Concern not found");
  if (!department || !level) throw new Error("Department and level are required");

  // 🔹 Static escalation map (destination users)
  const ESCALATION_USER_MAP = {
    PGRO: null,
    CEO: "68ef88c724a8a2a8317e0cb3", // Jalpa Raichura
    "Board of Directors": "68ef884624a8a2a8317e0cab", // Mayank Thakkar
    "Medical Director": "68ef88b124a8a2a8317e0caf", // Shivani Kathrotiya
  };
  const toUserId = ESCALATION_USER_MAP[level] || null;

  // ✅ Ensure department block exists
  if (!concern[department]) concern[department] = {};

  // ✅ Create escalation object inside the department
  concern[department].status = "escalated";
  concern[department].escalation = {
    note: note || "",
    level,
    escalatedBy: userId || null,
    escalatedAt: new Date(),
    toUser: toUserId,
  };

  // ✅ Always set main complaint status to "escalated"
  concern.status = "escalated";
  concern.updatedAt = new Date();

  await concern.save();
  const user = getModel("GIRIRAJUser");

  // ✅ Send FCM Notification (optional)
  if (toUserId) {
    const targetUser = await user.findById(toUserId)
      .select("name fcmTokens")
      .lean();

    if (targetUser?.fcmTokens?.length) {
      await sendNotification({
        tokens: targetUser.fcmTokens,
        title: `⚠️ ${department} Escalated to ${level}`,
        body: `Complaint from ${concern.patientName || "N/A"} escalated by ${department}.`,
        data: {
          concernId: String(concern._id),
          department,
          level,
          type: "IPD_PARTIAL_ESCALATED",
        },
      });
    }
  }

  // ✅ Return final result
  return {
    success: true,
    message: `${department} escalated to ${level}`,
    data: concern,
  };
};

const getPartialResolveDetails = async (concernId) => {
  const IPDModel = getModel("GIRIRAJIPDConcern");
  const concern = await IPDModel.findById(concernId).lean()
    .populate("resolution.resolvedBy", "name")
    .lean();

  if (!concern) {
    throw new Error("Concern not found");
  }

  const departments = [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "nursing",
  ];

  const deptData = {};

  departments.forEach((dept) => {
    if (concern[dept]) {
      const d = concern[dept];
      deptData[dept] = {
        status: d.status || "open",
        mode: d.mode || null,
        text: d.text || "",
        attachments: Array.isArray(d.attachments) ? d.attachments : [],
        resolution: d.resolution || null,
      };
    }
  });

  return {
    complaintId: concern.complaintId,
    patientName: concern.patientName,
    status: concern.status,
    createdAt: concern.createdAt,
    updatedAt: concern.updatedAt,
    ...deptData,
  };
};

const createNote = async (payload) => {
  const notes = getModel("GIRIRAJNote");
  const note = await notes.create(payload);
  return await note.populate({
    path: "userId",
    select: "name email",
    model: payload.userModel,
  });
};

const getAllNotes = async () => {
  const notes = getModel("GIRIRAJNote");
  return await notes.find().lean().sort({ createdAt: -1 });
}

const getNoteById = async (id) => {
  const notes = getModel("GIRIRAJNote");
  return await notes.findById(id).lean();
}

const deleteNote = async (id) => {
  const notes = getModel("GIRIRAJNote");
  return await notes.findByIdAndDelete(id);
}

const updateNote = async (id, update) => {
  const notes = getModel("GIRIRAJNote");
  const patient = await notes.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Data not found');
  return patient;
};

const getNotesByUserId = async (userId) => {
  try {
    if (!userId) {
      console.warn("⚠️ No userId provided to getNotesByUserId");
      return [];
    }
  const note = getModel("GIRIRAJNote");

    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn("⚠️ Invalid userId format:", userId);
      return [];
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // ✅ Fetch all notes where userId matches (regardless of ref type)
    const notes = await note.find({
      userId: objectId,
    })
      .populate("userId") // optional: populate user info if needed
      .sort({ updatedAt: -1 })
      .lean();

    console.log(`✅ Found ${notes.length} notes for userId ${userId}`);
    return notes;
  } catch (error) {
    console.error("❌ Error in getNotesByUserId:", error);
    return [];
  }
};


const createTask = async (payload) => {
  const { userId } = payload;
  if (!userId) throw new ApiError(400, "userId is required");
  const user = getModel("GIRIRAJRoleUser");
  const task = getModel("GIRIRAJTask");

  // 🔍 Automatically detect which model the ID belongs to (User or RoleUser)
  let userModel = "GIRIRAJUser";
  const isRoleUser = await user.exists({ _id: userId });
  if (isRoleUser) userModel = "GIRIRAJRoleUser";

  const taskData = {
    ...payload,
    userModel,
  };

  const newTask = await task.create(taskData);
  return newTask;
};

// 🟣 Get all tasks (for admin only)
const getAllTask = async () => {
  const task = getModel("GIRIRAJTask");
  return await task.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

// 🔹 Get task by ID
const getTaskById = async (id) => {
  return await task.findById(id)
    .populate("userId", "name email")
    .lean();
};

// 🔹 Get all tasks by userId (for normal users)
const getTasksByUserId = async (userId) => {
  const task = getModel("GIRIRAJTask");

  if (!userId) throw new ApiError(400, "userId is required");

  const isValid = mongoose.Types.ObjectId.isValid(userId);
  if (!isValid) throw new ApiError(400, "Invalid userId format");

  const tasks = await task.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return tasks;
};

// 🔸 Delete task
const deleteTask = async (id) => {
  const task = getModel("GIRIRAJTask");
  const deleted = await task.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Task not found");
  return deleted;
};

// 🔸 Update task
const updateTask = async (id, update) => {
  const tasks = getModel("GIRIRAJTask");

  const task = await tasks.findByIdAndUpdate(id, update, { new: true });
  if (!task) throw new ApiError(404, "Task not found");
  return task;
};

const getInternalComplaint = async (useBackup = false) => {
  const Model = getModel("GIRIRAJInternalComplaint", useBackup);
  if (!Model) throw new Error("❌ GIRIRAJInternalComplaint model not found");

  return await Model.find()
    .sort({ createdAt: -1 })
    .lean();
};

const getInternalComplaintById = async (id, useBackup = false) => {
  const Model = getModel("GIRIRAJInternalComplaint", useBackup);
  if (!Model) throw new Error("❌ GIRIRAJInternalComplaint model not found");

  return await Model.findById(id).lean();
};

const deleteInternalComplaint = async (id) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");
  return await InternalComplaint.findByIdAndDelete(id);
}

const updateInternalComplaint = async (id, update) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");

  const patient = await InternalComplaint.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Complaint not found');
  return patient;
};

const forwardInternalComplaint = async (
  complaintId,
  department,
  data,
  userId
) => {
  if (!INTERNAL_DEPT_KEYS.includes(department)) {
    throw new Error("Invalid department name");
  }
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");

  const complaint = await InternalComplaint.findById(
    complaintId
  );
  if (!complaint) throw new Error("Complaint not found");

  complaint[department] = { ...data, status: "forwarded" };

  complaint.forwards?.push({
    toDepartment: department,
    note: data.note || "",
    forwardedBy: userId || null,
    forwardedAt: new Date(),
  });

  complaint.status = "forwarded";
  await complaint.save();

  // 🔔 Notify next department
  const tokens = [];
  const roleUser = getModel("GIRIRAJRoleUser");
  const roleUsers = await roleUser.find({
    $or: [{ department }, { departments: { $in: [department] } }],
  })
    .populate({ path: "user", select: "fcmTokens" })
    .lean();

  for (const ru of roleUsers) {
    if (ru?.user?.fcmTokens) tokens.push(...ru.user.fcmTokens);
  }

  await sendNotification({
    tokens,
    title: "Internal Complaint Forwarded",
    body: `Complaint forwarded to ${department}`,
    data: {
      complaintId: complaint._id.toString(),
      department,
    },
  });

  return complaint;
};

/* --------------------------------------------
   🔹 ESCALATE INTERNAL COMPLAINT
---------------------------------------------*/
const escalateInternalComplaint = async (complaintId, { level, note, userId }) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");
  const complaint = await InternalComplaint.findById(
    complaintId
  );
  if (!complaint) throw new Error("Complaint not found");

  const ESCALATION_USER_MAP = {
    PGRO: null,
    CEO: "68ef88c724a8a2a8317e0cb3",
    "Board of Directors": "68ef884624a8a2a8317e0cab",
    "Medical Director": "68ef88b124a8a2a8317e0caf",
  };
  const targetUserId = ESCALATION_USER_MAP[level];

  complaint.escalations.push({
    level,
    note,
    escalatedBy: userId,
    escalatedAt: new Date(),
  });
  complaint.status = "escalated";
  await complaint.save();
  const user = getModel("GIRIRAJUser");

  if (targetUserId) {
    const targetUser = await user.findById(targetUserId)
      .select("name fcmTokens")
      .lean();

    if (targetUser?.fcmTokens?.length > 0) {
      await sendNotification({
        tokens: targetUser.fcmTokens,
        title: `⚠️ Internal Complaint Escalated to ${level}`,
        body: `Complaint by ${complaint.employeeName} has been escalated.`,
        data: {
          complaintId: complaint._id.toString(),
          level,
          type: "INTERNAL_COMPLAINT_ESCALATED",
        },
      });
    }
  }

  return complaint;
};

/* --------------------------------------------
   🔹 RESOLVE INTERNAL COMPLAINT
---------------------------------------------*/
const resolveInternalComplaint = async (
  complaintId,
  { note, proof, userId }
) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");
  const complaint = await InternalComplaint.findById(
    complaintId
  );
  if (!complaint) throw new Error("Complaint not found");

  complaint.resolution = {
    note,
    proof,
    resolvedBy: userId,
    resolvedAt: new Date(),
  };
  complaint.status = "resolved";
  await complaint.save();

  // 🔔 Notify HR/Admin
  const user = getModel("GIRIRAJRoleUser");
  const hrUsers = await user.find({
    $or: [{ department: "HR" }, { departments: { $in: ["HR"] } }],
  })
    .populate({ path: "user", select: "fcmTokens" })
    .lean();

  const tokens = [];
  for (const u of hrUsers) {
    if (u?.user?.fcmTokens) tokens.push(...u.user.fcmTokens);
  }

  if (tokens.length > 0) {
    await sendNotification({
      tokens,
      title: "Internal Complaint Resolved",
      body: `Complaint raised by ${complaint.employeeName} has been resolved.`,
      data: {
        complaintId: complaint._id.toString(),
        type: "INTERNAL_COMPLAINT_RESOLVED",
      },
    });
  }

  return complaint;
};

/* --------------------------------------------
   🔹 IN-PROGRESS UPDATE
---------------------------------------------*/
const updateInternalProgress = async (
  complaintId,
  note,
  userId
) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");

  const complaint =
    (await InternalComplaint.findById(complaintId)) ||
    (await InternalComplaint.findOne({
      complaintId,
    }));

  if (!complaint) throw new Error("Complaint not found");

  complaint.progress = {
    note,
    updatedBy: userId,
    updatedAt: new Date(),
  };
  complaint.status = "in_progress";
  await complaint.save();

  await sendNotification({
    title: "Progress Updated",
    body: `Complaint ${complaint.complaintId} marked In-Progress: ${note}`,
    topic: "internal-admin",
    data: {
      complaintId: complaint._id.toString(),
      status: "in_progress",
    },
  });

  return complaint;
};

/* --------------------------------------------
   🔹 GET HISTORY TIMELINE
---------------------------------------------*/
const getInternalComplaintHistory = async (concernId) => {
  // 1️⃣ Fetch concern with full populated references
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");
  const concernDoc = await InternalComplaint.findById(concernId)
    .populate("escalations.escalatedBy", "name email")
    .populate("resolution.resolvedBy", "name email")
    .populate("forwards.forwardedBy", "name email")
    .populate("progress.updatedBy", "name email");

  if (!concernDoc) throw new Error("Concern not found");

  const concern = concernDoc.toObject();
  const history = [];
  const forwardedDepartments = [];

  // 2️⃣ Complaint Created
  history.push({
    type: "created",
    label: "Complaint Created",
    status: concern.status,
    at: concern.createdAt,
    details: {
      patientName: concern.patientName,
      complaintId: concern.complaintId,
    },
  });

  // 3️⃣ Global Forwards
  if (Array.isArray(concern.forwards) && concern.forwards.length > 0) {
    concern.forwards.forEach((fwd) => {
      forwardedDepartments.push(fwd.toDepartment);
      history.push({
        type: "forwarded",
        label: `Complaint Forwarded to ${fwd.toDepartment}`,
        note: fwd.note || fwd.text || "",
        by: fwd.forwardedBy || null,
        at: fwd.forwardedAt || concern.updatedAt,
      });
    });
  }

  // 4️⃣ Global Escalations
  if (Array.isArray(concern.escalations) && concern.escalations.length > 0) {
    concern.escalations.forEach((esc) => {
      history.push({
        type: "escalated",
        label: `Complaint Escalated to ${esc.level || "Higher Authority"}`,
        note: esc.note || esc.text || "",
        level: esc.level || null,
        by: esc.escalatedBy || null,
        at: esc.escalatedAt || concern.updatedAt,
      });
    });
  }

  // 5️⃣ Global In-Progress
  if (concern.progress && (concern.progress.note || concern.progress.text)) {
    history.push({
      type: "in_progress",
      label: "Complaint marked In-Progress",
      note: concern.progress.note || concern.progress.text || "",
      by: concern.progress.updatedBy || null,
      at: concern.progress.updatedAt || concern.updatedAt,
    });
  }

  // 6️⃣ Global Resolution
  if (concern.resolution && (concern.resolution.note || concern.resolution.text)) {
    history.push({
      type: "resolved",
      label: "Complaint Resolved",
      note: concern.resolution.note || concern.resolution.text || "",
      proof: concern.resolution.proof || [],
      by: concern.resolution.resolvedBy || null,
      at: concern.resolution.resolvedAt || concern.updatedAt,
    });
  }



  for (const dept of INTERNAL_DEPT_KEYS) {
    const block = concern[dept];
    if (!block) continue;

    const baseNote =
      block.progress?.note ||
      block.escalation?.note ||
      block.resolution?.note ||
      block.note ||
      block.text ||
      "";

    // 🟡 Partial In-Progress
    if (block.status === "in_progress") {
      history.push({
        type: "in_progress",
        label: `Department (${dept}) marked In-Progress`,
        note: baseNote,
        by: block.progress?.updatedBy || null,
        at: block.progress?.updatedAt || concern.updatedAt,
        department: dept,
      });
    }

    // 🔴 Partial Escalated
    if (block.status === "escalated") {
      const escalateNote =
        block.escalation?.note ||
        block.escalation?.text ||
        block.note ||
        block.text ||
        "";

      history.push({
        type: "escalated",
        label: `Department (${dept}) Escalated${block.escalation?.level ? ` to ${block.escalation.level}` : ""
          }`,
        note: escalateNote, // ✅ display the real note written during escalation
        level: block.escalation?.level || null,
        by: block.escalation?.escalatedBy || null,
        at: block.escalation?.escalatedAt || concern.updatedAt,
        department: dept,
      });
    }


    // 🟢 Partial Resolved
    if (block.status === "resolved") {
      history.push({
        type: "resolved",
        label: `Department (${dept}) Resolved`,
        note: baseNote,
        proof: block.resolution?.proof || [],
        by: block.resolution?.resolvedBy || null,
        at: block.resolution?.resolvedAt || concern.updatedAt,
        department: dept,
      });
    }

    // 🟣 Partial Forwarded
    if (block.status === "forwarded") {
      history.push({
        type: "forwarded",
        label: `Department (${dept}) Forwarded`,
        note: baseNote,
        by: block.forwardedBy || null,
        at: block.forwardedAt || concern.updatedAt,
        department: dept,
      });
    }
  }

  // -------------------------------------------------
  // 8️⃣ Sort all history chronologically
  // -------------------------------------------------
  const timeline = history.sort(
    (a, b) => new Date(a.at || a.createdAt) - new Date(b.at || b.createdAt)
  );

  // -------------------------------------------------
  // 9️⃣ Return formatted response
  // -------------------------------------------------
  return {
    concernId: concern._id,
    forwardedDepartments,
    timeline,
  };
};

const partialInProgressInternal = async (
  complaintId,
  { department, note, userId }
) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");
  let complaint =
    (await InternalComplaint.findById(complaintId)) ||
    (await InternalComplaint.findOne({ complaintId }));

  if (!complaint) throw new Error("Complaint not found");
  if (!department) throw new Error("Department is required");

  // ✅ Set department block
  complaint[department] = complaint[department] || {};
  complaint[department].status = "in_progress";
  complaint[department].progress = {
    note: note || "",
    updatedBy: userId || null,
    updatedAt: new Date(),
  };

  complaint.status = "in_progress";
  complaint.updatedAt = new Date();
  await complaint.save();

  // 🔔 Notify admins
  await sendNotification({
    title: "Internal Complaint In-Progress",
    body: `Department ${department} marked complaint ${complaint.complaintId} in progress.`,
    topic: "internal-admin",
    data: {
      complaintId: complaint._id.toString(),
      department,
      status: "in_progress",
    },
  });

  return {
    success: true,
    message: `${department} marked as in progress`,
    data: {
      _id: complaint._id,
      status: "in_progress",
      department,
      note,
    },
  };
};

/* --------------------------------------------
   🔹 PARTIAL ESCALATE
---------------------------------------------*/
const partialEscalateInternal = async (
  complaintId,
  { department, note, level, userId }
) => {
  let complaint = null;
  const internalComplaint = getModel("GIRIRAJInternalComplaint");

  if (mongoose.Types.ObjectId.isValid(complaintId)) {
    complaint = await internalComplaint.findById(
      complaintId
    );
  }
  if (!complaint) {
    complaint = await internalComplaint.findOne({
      complaintId,
    });
  }

  if (!complaint) throw new Error("Complaint not found");
  if (!department || !level) throw new Error("Department and level are required");

  const ESCALATION_USER_MAP = {
    PGRO: null,
    CEO: "68ef88c724a8a2a8317e0cb3", // Jalpa Raichura
    "Board of Directors": "68ef884624a8a2a8317e0cab", // Mayank Thakkar
    "Medical Director": "68ef88b124a8a2a8317e0caf", // Shivani Kathrotiya
  };
  const toUserId = ESCALATION_USER_MAP[level] || null;

  if (!complaint[department]) complaint[department] = {};
  complaint[department].status = "escalated";
  complaint[department].escalation = {
    note: note || "",
    level,
    escalatedBy: userId || null,
    escalatedAt: new Date(),
    toUser: toUserId,
  };

  complaint.status = "escalated";
  complaint.updatedAt = new Date();
  await complaint.save();
  const user = getModel("GIRIRAJUser");

  // 🔔 Notify Escalation Target
  if (toUserId) {
    const targetUser = await user.findById(toUserId)
      .select("name fcmTokens")
      .lean();

    if (targetUser?.fcmTokens?.length) {
      await sendNotification({
        tokens: targetUser.fcmTokens,
        title: `⚠️ ${department} Escalated to ${level}`,
        body: `Internal complaint from ${complaint.employeeName} escalated by ${department}.`,
        data: {
          complaintId: String(complaint._id),
          department,
          level,
          type: "INTERNAL_PARTIAL_ESCALATED",
        },
      });
    }
  }

  return {
    success: true,
    message: `${department} escalated to ${level}`,
    data: complaint,
  };
};

/* --------------------------------------------
   🔹 PARTIAL RESOLVE
---------------------------------------------*/
const partialResolveInternal = async (
  complaintId,
  { department, note, proof, userId }
) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");
  const complaint = await InternalComplaint.findById(
    complaintId
  );
  if (!complaint) throw new Error("Complaint not found");
  if (!department) throw new Error("Department is required");

  // ✅ Ensure department exists
  if (!complaint[department]) complaint[department] = {};
  complaint[department].status = "resolved";
  complaint[department].resolution = {
    note: note || "",
    proof: proof || [],
    resolvedBy: userId || null,
    resolvedAt: new Date(),
  };

  // ✅ Count active departments
  const activeDepts = INTERNAL_DEPT_KEYS.filter(
    (key) => complaint[key] && (complaint[key].text || complaint[key].attachments?.length)
  );
  const resolvedCount = activeDepts.filter(
    (key) => complaint[key]?.status === "resolved"
  ).length;

  // ✅ Update global status
  complaint.status =
    resolvedCount === activeDepts.length && activeDepts.length > 0
      ? "resolved"
      : "partial";

  complaint.updatedAt = new Date();
  await complaint.save();

  // 🔔 Notify HR/Admin
  await sendNotification({
    title: "Internal Complaint Resolved",
    body: `Department ${department} resolved internal complaint by ${complaint.employeeName}.`,
    topic: "internal-admin",
    data: {
      complaintId: complaint._id.toString(),
      status: complaint.status,
      department,
    },
  });

  return {
    success: true,
    message:
      complaint.status === "resolved"
        ? "All departments resolved. Complaint closed."
        : `Department ${department} resolved. Complaint remains partially open.`,
    data: {
      _id: complaint._id,
      status: complaint.status,
      department,
      note,
    },
  };
};

/* --------------------------------------------
   🔹 PARTIAL RESOLVE DETAILS
---------------------------------------------*/
const getPartialResolveInternalDetails = async (complaintId) => {
  const InternalComplaint = getModel("GIRIRAJInternalComplaint");

  const complaint = await InternalComplaint.findById(
    complaintId
  )
    .populate("resolution.resolvedBy", "name")
    .lean();

  if (!complaint) throw new Error("Complaint not found");

  const deptData = {};
  INTERNAL_DEPT_KEYS.forEach((dept) => {
    if (complaint[dept]) {
      const d = complaint[dept];
      deptData[dept] = {
        status: d.status || "open",
        mode: d.mode || null,
        text: d.text || "",
        attachments: Array.isArray(d.attachments) ? d.attachments : [],
        resolution: d.resolution || null,
      };
    }
  });

  return {
    complaintId: complaint.complaintId,
    employeeName: complaint.employeeName,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    ...deptData,
  };
};

/**
 * Update an IPD Concern as an Admin (resolve / forward / escalate / progress)
 * Handles both partial and full updates  
 */
async function updateAdminAction(id, actionType, data, adminId) {
  const ComplaintModel = getModel("GIRIRAJIPDConcern");
  const complaint = await ComplaintModel.findById(id);
  if (!complaint) throw new Error("Complaint not found");

  let {
    note = "",
    proof = [],
    department,
    isPartial = false,
    level,
    toDepartment,
    actionTypeForDept = null
  } = data;

  const allowedActions = ["resolved", "forwarded", "escalated", "progress"];
  if (!allowedActions.includes(actionType)) {
    throw new Error(`Invalid action type: ${actionType}`);
  }

  // ⭐ FIX — auto-detect department if missing
  if (isPartial) {
    if (!department || Array.isArray(department)) {
      if (Array.isArray(department)) department = department[0];
      if (!department && complaint.modules?.length === 1) {
        department = complaint.modules[0];
      }
    }

    if (!department) {
      throw new Error("Department is required for partial action");
    }
  }

  // ---- LOG ADMIN ACTION ----
  complaint.adminActions = complaint.adminActions || {};
  complaint.adminActions[actionType] = {
    note,
    proof,
    level,
    toDepartment,
    by: adminId,
    type: actionType,
    isPartial,
    at: new Date()
  };

  complaint.history = complaint.history || [];
  complaint.history.push({
    action: actionType,
    note,
    proof,
    by: adminId,
    at: new Date(),
    isPartial,
    affectedDepartments: isPartial ? [department] : []
  });

  // ==== UPDATE ONE DEPARTMENT ====
  const updateDept = (deptKey) => {
    const sec = complaint[deptKey];
    if (!sec) return;

    sec.updatedByAdmin = true;
    sec.adminNote = note;

    if (actionType === "resolved") {
      sec.status = "resolved_by_admin";
      sec.resolution = {
        actionType: actionTypeForDept,
        actionNote: note,
        proof,
        resolvedBy: adminId,
        resolvedAt: new Date(),
        resolvedType: "admin"
      };
    }

    if (actionType === "forwarded") {
      sec.status = "forwarded";
      sec.forward = {
        note,
        toDepartment,
        forwardedBy: adminId,
        forwardedAt: new Date()
      };
    }

    if (actionType === "escalated") {
      sec.status = "escalated";
      sec.escalation = {
        note,
        level,
        escalatedBy: adminId,
        escalatedAt: new Date()
      };
    }

    if (actionType === "progress") {
      sec.status = "in_progress";
      sec.progress = {
        note,
        updatedBy: adminId,
        updatedAt: new Date()
      };
    }
  };

  // === PARTIAL ===
  if (isPartial) {
    updateDept(department);
  }

  // === FULL ===
  else {
    complaint.modules.forEach((dept) => {
      const sec = complaint[dept];
      if (!sec) return;

      const hasText = sec.text?.trim()?.length > 0;
      const hasFiles = Array.isArray(sec.attachments) && sec.attachments.length > 0;

      if (hasText || hasFiles) updateDept(dept);
    });
  }

  // ⭐ Recalculate overall complaint status
  complaint.status = calculateComplaintStatus(complaint);

  complaint.updatedAt = new Date();
  await complaint.save();

  return {
    success: true,
    message: `Admin ${actionType} action completed successfully`,
    complaint
  };
}

async function partialAdminResolveConcern(
  complaintId,
  { department, note = "", proof = [], userId, actionTypeForDept = null }
) {
  const ComplaintModel = getModel("GIRIRAJIPDConcern");
  const complaint = await ComplaintModel.findById(complaintId);
  if (!complaint) throw new Error("Complaint not found");

  // ⭐ FIX — Auto-detect department
  if (!department || Array.isArray(department)) {
    if (Array.isArray(department)) department = department[0];

    if (!department && complaint.modules?.length === 1) {
      department = complaint.modules[0];
    }
  }

  if (!department) {
    throw new Error("Department is required and could not be detected");
  }

  const section = complaint[department];
  if (!section) throw new Error(`Department invalid: ${department}`);

  section.status = "resolved_by_admin";
  section.updatedByAdmin = true;
  section.resolution = {
    actionType: actionTypeForDept,
    actionNote: note,
    proof,
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolvedType: "admin"
  };

  // ⭐ Status update
  complaint.status = calculateComplaintStatus(complaint);

  complaint.history = complaint.history || [];
  complaint.history.push({
    action: "resolved_by_admin",
    department,
    note,
    proof,
    actionType: actionTypeForDept,
    by: userId,
    at: new Date(),
    isPartial: complaint.status !== "resolved"
  });

  await complaint.save();

  return {
    success: true,
    message:
      complaint.status === "resolved"
        ? "Complaint fully resolved by admin."
        : `Department ${department} resolved by admin. Complaint partially open.`,
    complaint
  };
}


/* --------------------- PARTIAL IN-PROGRESS --------------------- */
const partialAdminInProgressConcern = async (
  concernId,
  { department, note, userId }
) => {
  const IPDConcern = getModel("GIRIRAJIPDConcern");
  let concern = await IPDConcern.findById(concernId);
  if (!concern)
    concern = await IPDConcern.findOne({ complaintId: concernId });
  if (!concern) throw new Error("Concern not found");
  if (!department) throw new Error("Department is required");

  concern[department] = concern[department] || {};
  concern[department].status = "in_progress";
  concern[department].progress = {
    note: note || "",
    updatedBy: userId || null,
    updatedAt: new Date(),
  };

  concern.status = "in_progress";
  concern.updatedAt = new Date();
  await concern.save();

  return {
    success: true,
    message: `⏳ ${department} marked as in progress.`,
    data: {
      _id: concern._id,
      status: "in_progress",
      department,
      note,
    },
  };
};

/* --------------------- PARTIAL ESCALATE --------------------- */
const partialAdminEscalateConcern = async (
  concernId,
  { department, note, level, userId }
) => {
  let concern = null;

  // find by ObjectId or complaintId
  if (mongoose.Types.ObjectId.isValid(concernId)) {
    const IPDConcern = getModel("GIRIRAJIPDConcern");
    concern = await IPDConcern.findById(concernId);
  }
  if (!concern) {
    concern = await IPDConcern.findOne({ complaintId: concernId });
  }

  if (!concern) throw new Error("Concern not found");
  if (!department || !level) throw new Error("Department and level are required");

  const ESCALATION_USER_MAP = {
    PGRO: null,
    CEO: "68ef88c724a8a2a8317e0cb3",
    "Board of Directors": "68ef884624a8a2a8317e0cab",
    "Medical Director": "68ef88b124a8a2a8317e0caf",
  };
  const toUserId = ESCALATION_USER_MAP[level] || null;

  concern[department] = concern[department] || {};
  concern[department].status = "escalated";
  concern[department].escalation = {
    note: note || "",
    level,
    escalatedBy: userId || null,
    escalatedAt: new Date(),
    toUser: toUserId,
  };

  concern.status = "escalated";
  concern.updatedAt = new Date();
  await concern.save();
  const user = getModel("GIRIRAJUser");

  // optional push notification
  if (toUserId) {
    const targetUser = await user.findById(toUserId)
      .select("name fcmTokens")
      .lean();
    if (targetUser?.fcmTokens?.length) {
      await sendNotification({
        tokens: targetUser.fcmTokens,
        title: `⚠️ ${department} Escalated to ${level}`,
        body: `Complaint from ${concern.patientName || "N/A"} escalated by ${department}.`,
        data: {
          concernId: String(concern._id),
          department,
          level,
          type: "IPD_PARTIAL_ESCALATED",
        },
      });
    }
  }

  return {
    success: true,
    message: `🚨 ${department} escalated to ${level}`,
    data: concern,
  };
};

/* --------------------- GET PARTIAL RESOLUTION DETAILS --------------------- */
const getAdminPartialResolveDetails = async (concernId) => {
  const IPDConcern = getModel("GIRIRAJIPDConcern");
  const concern = await IPDConcern.findById(concernId)
    .populate("resolution.resolvedBy", "name")
    .lean();

  if (!concern) throw new Error("Concern not found");

  const departments = [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "nursing",
  ];

  const deptData = {};
  departments.forEach((dept) => {
    if (concern[dept]) {
      const d = concern[dept];
      deptData[dept] = {
        status: d.status || "open",
        mode: d.mode || null,
        text: d.text || "",
        attachments: Array.isArray(d.attachments) ? d.attachments : [],
        resolution: d.resolution || null,
      };
    }
  });

  return {
    complaintId: concern.complaintId,
    patientName: concern.patientName,
    status: concern.status,
    createdAt: concern.createdAt,
    updatedAt: concern.updatedAt,
    departments: deptData,
  };
};

const createTaskList = async (payload) => {
  const { userId } = payload;
  if (!userId) throw new ApiError(400, "userId is required");
  const roleUser = getModel("GIRIRAJRoleUser");

  let userModel = "GIRIRAJUser";
  const isRoleUser = await roleUser.exists({ _id: userId });
  if (isRoleUser) userModel = "GIRIRAJRoleUser";

  const taskData = {
    ...payload,
    userModel,
  };

  const newTask = await roleUser.create(taskData);
  return newTask;
};

const getAllTaskList = async () => {
  const task = getModel("GIRIRAJTaskList");
  return await task?.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

const getTasksByList = async (listId, userId, userModel) => {
  if (!listId) throw new Error("List ID is required");

  const query = {};

  // ✅ Handle ObjectId conversion
  if (mongoose.Types.ObjectId.isValid(listId)) {
    query.listId = new mongoose.Types.ObjectId(listId);
  } else {
    query.listId = listId;
  }

  // ✅ Add userId (convert to ObjectId if valid)
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    query.userId = new mongoose.Types.ObjectId(userId);
  } else if (userId) {
    query.userId = userId;
  }

  // ✅ Flexible match for userModel (to support all roles)
  if (userModel) {
    query.userModel = { $in: [userModel, "GIRIRAJUser", "GIRIRAJRoleUser"] };
  }

  console.log("🧩 Task Query:", query);
  const task = getModel("GIRIRAJTask");

  const tasks = await task.find(query)
    .sort({ date: 1, time: 1 })
    .lean();

  console.log("✅ Found Tasks:", tasks.length);

  return tasks || [];
};

const getTaskListByUserId = async (userId) => {
  if (!userId) throw new ApiError(400, "userId is required");

  const isValid = mongoose.Types.ObjectId.isValid(userId);
  if (!isValid) throw new ApiError(400, "Invalid userId format");

  const TaskListModel = getModel("GIRIRAJTaskList");

  if (!TaskListModel || typeof TaskListModel.find !== "function") {
    throw new Error("❌ GIRIRAJTaskList model not found or invalid");
  }

  const tasks = await TaskListModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return tasks;
};

const getAllTaskListsWithTasks = async (userId, userModel) => {
  if (!userId) throw new Error("User ID is required");

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const TaskListModel = getModel("GIRIRAJTaskList");
  const TaskModel = getModel("GIRIRAJTask");

  if (!TaskListModel || typeof TaskListModel.find !== "function") {
    throw new Error("❌ GIRIRAJTaskList model not found or invalid");
  }

  if (!TaskModel || typeof TaskModel.find !== "function") {
    throw new Error("❌ GIRIRAJTask model not found or invalid");
  }

  const possibleModels = userModel
    ? [userModel]
    : ["GIRIRAJUser", "GIRIRAJRoleUser"];

  // 🗂 Fetch all lists for the user
  const lists = await TaskListModel.find({
    userId: userObjectId,
    userModel: { $in: possibleModels },
  })
    .lean()
    .sort({ createdAt: -1 });

  // 📋 Fetch tasks for each list
  const results = await Promise.all(
    lists.map(async (list) => {
      const tasks = await TaskModel.find({
        listId: list._id,
        userId: userObjectId,
        userModel: { $in: possibleModels },
      })
        .lean()
        .sort({ createdAt: -1 });

      return { ...list, tasks };
    })
  );

  return results;
};

const searchComplaints = async (query) => {
  try {
    if (!query || typeof query !== "string") return [];

    const Model = getModel("GIRIRAJIPDConcern");
    if (!Model || typeof Model.find !== "function") {
      throw new Error("❌ GIRIRAJIPDConcern model not found or invalid");
    }

    const regex = new RegExp(query.trim(), "i");

    const results = await Model.find({
      $or: [
        { complaintId: regex },
        { patientName: regex },
        { bedNo: regex },
        { department: regex },
      ],
    })
      .select("_id complaintId patientName department bedNo status createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return results || [];
  } catch (error) {
    console.error("❌ Error in searchComplaints:", error.message);
    return [];
  }
};


const createBugReportService = async (data) => {
  try {
    const Model = getModel("GIRIRAJBug");

    if (!Model || typeof Model.create !== "function") {
      throw new Error("❌ GIRIRAJBug model not found or invalid");
    }

    // ✅ Create bug report
    const newBug = await Model.create(data);

    // ✅ Populate user details dynamically
    const populatedBug = await newBug.populate({
      path: "userId",
      select: "name email role",
      model: data.userModel,
      strictPopulate: false,
    });

    return populatedBug;
  } catch (error) {
    console.error("❌ Bug Report Creation Failed:", error);
    throw new Error("Failed to create bug report");
  }
};

const getAllBugReportsService = async () => {
  try {
    const Model = getModel("GIRIRAJBug");

    if (!Model || typeof Model.find !== "function") {
      throw new Error("❌ GIRIRAJBug model not found or invalid");
    }

    const bugs = await Model.find()
      .populate({ path: "userId", select: "name email role", strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    return bugs;
  } catch (error) {
    console.error("❌ getAllBugReportsService Error:", error);
    throw new Error("Failed to fetch bug reports");
  }
};

const updateBugStatusService = async (id, status) => {
  try {
    const Model = getModel("GIRIRAJBug");

    if (!Model || typeof Model.findByIdAndUpdate !== "function") {
      throw new Error("❌ GIRIRAJBug model not found or invalid");
    }

    const updated = await Model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    return updated;
  } catch (error) {
    console.error("❌ Error in updateBugStatusService:", error.message);
    throw new Error("Failed to update bug report status");
  }
};

const getNotificationSettingsService = async (userId, userModel) => {
  const Model = getModel("GIRIRAJNotificationSetting");

  if (!Model || typeof Model.findOne !== "function") {
    throw new Error("❌ GIRIRAJNotificationSetting model not found or invalid");
  }

  // 🔍 Try to find existing settings
  let settings = await Model.findOne({ userId, userModel }).lean();

  // 🆕 If not found, create default
  if (!settings) {
    settings = await Model.create({
      userId,
      userModel,
      complaint: true,
    });
  }

  return settings;
};


/* ----------------------------------------------------
   🔹 Update Notification Settings
---------------------------------------------------- */
const updateNotificationSettingsService = async (userId, userModel, payload) => {
  const Model = getModel("GIRIRAJNotificationSetting");

  if (!Model || typeof Model.findOneAndUpdate !== "function") {
    throw new Error("GIRIRAJNotificationSetting model not found or invalid");
  }

  const updated = await Model.findOneAndUpdate(
    { userId, userModel },
    {
      opd: payload.opd ?? false,
      ipd: payload.ipd ?? false,
      complaint: payload.complaint ?? true,
      internalComplaint: payload.internalComplaint ?? false,
      statusChange: payload.statusChange ?? false,
    },
    { upsert: true, new: true } // ✅ Creates a new document if missing
  ).lean();

  return updated;
};
/* ===========================================================
   ⭐ EMPLOYEE FEEDBACK USING getModel()
   =========================================================== */

const getEmployeeFeedback = async (page = 1, limit = 50) => {
  const Model = getModel("GIRIRAJEmployeeFeedback");

  const [feedbacks, total] = await Promise.all([
    Model.find()
      .select(
        "employeeName employeeId mobileNumber floor ratings trainingNeeded challengesSupportNeeded suggestions overallRecommendation createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Model.countDocuments(),
  ]);

  return {
    feedbacks,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// 🔹 Get Single
const getEmployeeFeedbackById = async (id) => {
  const Model = getModel("GIRIRAJEmployeeFeedback");

  return (
    (await Model.findById(id)
      .select(
        "employeeName employeeId mobileNumber floor ratings trainingNeeded challengesSupportNeeded suggestions overallRecommendation createdAt updatedAt"
      )
      .lean()) || null
  );
};

// 🔹 Delete
const deleteEmployeeFeedback = async (id) => {
  const Model = getModel("GIRIRAJEmployeeFeedback");
  return await Model.findByIdAndDelete(id);
};

// 🔹 Update
const updateEmployeeFeedback = async (id, update) => {
  const Model = getModel("GIRIRAJEmployeeFeedback");

  const feedback = await Model.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!feedback) throw new ApiError(404, "Feedback not found");
  return feedback;
};

// 🔹 Group By Rating
const getEmployeeFeedbackByRating = async () => {
  const Model = getModel("GIRIRAJEmployeeFeedback");

  const feedbacks = await Model.find().lean();
  const grouped = {};

  for (const fb of feedbacks) {
    const ratings = fb.ratings ? Object.values(fb.ratings) : [];
    const avg =
      ratings.length > 0
        ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
        : 0;

    const label =
      avg >= 5
        ? "Excellent"
        : avg >= 4
        ? "Good"
        : avg >= 3
        ? "Average"
        : avg >= 2
        ? "Poor"
        : "Very Poor";

    if (!grouped[label]) grouped[label] = [];

    grouped[label].push({
      employeeName: fb.employeeName,
      employeeId: fb.employeeId,
      mobileNumber: fb.mobileNumber,
      floor: fb.floor,
      averageRating: avg,
      suggestions: fb.suggestions,
      trainingNeeded: fb.trainingNeeded,
      challengesSupportNeeded: fb.challengesSupportNeeded,
      overallRecommendation: fb.overallRecommendation,
      date: fb.createdAt,
    });
  }

  return grouped;
};

// 🔹 Most Frequent Rating Fields
const getFrequentEmployeeRatings = async () => {
  const Model = getModel("GIRIRAJEmployeeFeedback");

  const ratingKeys = [
    "jobSatisfaction",
    "feelingValued",
    "growthOpportunities",
    "trainingSupport",
    "welfareFacility",
    "trainingNeeded",
    "challengesSupportNeeded",
    "suggestions",
  ];

  const counts = {};
  ratingKeys.forEach((k) => (counts[k] = 0));

  const feedbacks = await Model.find({}, { ratings: 1 }).lean();

  feedbacks.forEach((fb) => {
    if (!fb.ratings) return;

    for (const key of ratingKeys) {
      if (typeof fb.ratings[key] === "number") {
        counts[key] += 1;
      }
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const pretty = (k) =>
    k
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());

  return sorted.filter((i) => i[1] > 0).map(([k]) => pretty(k));
};

/* ===========================================================
   ⭐ CONSULTANT FEEDBACK USING getModel()
   =========================================================== */

const getConsultantFeedback = async (page = 1, limit = 50) => {
  const Model = getModel("GIRIRAJConsultantFeedback");

  const [feedbacks, total] = await Promise.all([
    Model.find()
      .select(
        "doctorName language serviceRatings bdRatings managementFeedback finalComments createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Model.countDocuments(),
  ]);

  return {
    feedbacks,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

const getConsultantFeedbackById = async (id) => {
  const Model = getModel("GIRIRAJConsultantFeedback");

  return (
    (await Model.findById(id)
      .select(
        "doctorName language serviceRatings bdRatings managementFeedback finalComments ipAddress deviceInfo createdAt updatedAt"
      )
      .lean()) || null
  );
};

const deleteConsultantFeedback = async (id) => {
  const Model = getModel("GIRIRAJConsultantFeedback");
  return await Model.findByIdAndDelete(id);
};

const updateConsultantFeedback = async (id, update) => {
  const Model = getModel("GIRIRAJConsultantFeedback");

  const feedback = await Model.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!feedback) throw new ApiError(404, "Consultant Feedback not found");
  return feedback;
};

// 🔹 Group By Rating
const getConsultantFeedbackByRating = async () => {
  const Model = getModel("GIRIRAJConsultantFeedback");

  const feedbacks = await Model.find().lean();
  const grouped = {};

  for (const fb of feedbacks) {
    const allRatings = [
      ...(fb.serviceRatings || []),
      ...(fb.bdRatings || []),
      ...(fb.managementFeedback || []),
    ]
      .map((x) => x.rating)
      .filter((n) => typeof n === "number");

    const avg =
      allRatings.length > 0
        ? Math.round(allRatings.reduce((a, b) => a + b, 0) / allRatings.length)
        : 0;

    const label =
      avg >= 5
        ? "Excellent"
        : avg >= 4
        ? "Good"
        : avg >= 3
        ? "Average"
        : avg >= 2
        ? "Poor"
        : "Very Poor";

    if (!grouped[label]) grouped[label] = [];

    grouped[label].push({
      doctorName: fb.doctorName,
      averageRating: avg,
      comments: fb.finalComments,
      date: fb.createdAt,
    });
  }

  return grouped;
};

// 🔹 Most Frequent Consultant Rating Items
const getFrequentConsultantRatings = async () => {
  const Model = getModel("GIRIRAJConsultantFeedback");

  const sections = ["serviceRatings", "bdRatings", "managementFeedback"];
  const counts = {};

  const feedbacks = await Model.find(
    {},
    { serviceRatings: 1, bdRatings: 1, managementFeedback: 1 }
  ).lean();

  for (const fb of feedbacks) {
    for (const section of sections) {
      const items = fb[section];
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        if (!item.label) continue;

        if (!counts[item.label]) counts[item.label] = 0;

        if (typeof item.rating === "number") {
          counts[item.label] += 1;
        }
      }
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    keywords: sorted.filter((i) => i[1] > 0).map(([label]) => label),
  };
};



export default {
  createIPDPatient, getIPDPatientById, getIPDPatients, deleteIPDPatientById, updateIPDPatientById, createComplaint, getComplaintById, updateComplaint, getAllComplaints,
  createOPDPatient, getOPDPatientById, getOPDPatients, updateOPDPatientById, deleteOPDPatientById, getComplaintStatsByDepartment, getIPDPatientByRating, getOPDPatientByRating,
  createRole, getAllRoles, getRoleById, updateRole, deleteRole, createRoleUser, getAllRoleUsers, getRoleUserById, updateRoleUser, deleteRoleUser, getDashboard, createIPDConcern, getIPDConcern,
  getIPDPaConcernById, updateIPDConcernById, deleteIPDConcernById, forwardConcernToDepartment, getConcernsByDepartment, escalateConcern, resolveConcern, getConcernHistory, updateProgressRemarkService,
  createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, sendAndSaveNotification, getAllNotificationsService, getAllComplaintDetails, createBed, getBedById, getBeds,
  updatedBed, deleteBed, validateBedNumber, getComplaintSummary, getServiceWiseSummary, getFrequentRatingKeywords, getFrequentOPDRatings, partialResolveConcern, getPartialResolveDetails,
  partialInProgressConcern, partialEscalateConcern, createNote, getAllNotes, getNoteById, updateNote, deleteNote, createTask, getAllTask, getTaskById, updateTask, deleteTask, getNotesByUserId, getTasksByUserId,
  getInternalComplaint, getInternalComplaintById, updateInternalComplaint, deleteInternalComplaint, forwardInternalComplaint, escalateInternalComplaint, resolveInternalComplaint,
  getInternalComplaintHistory, updateInternalProgress, partialInProgressInternal, partialEscalateInternal, partialResolveInternal, getPartialResolveInternalDetails, updateAdminAction,
  partialAdminEscalateConcern, partialAdminInProgressConcern, partialAdminResolveConcern, getAdminPartialResolveDetails, createTaskList, getAllTaskList, getTasksByList, getTaskListByUserId,
  getAllTaskListsWithTasks, searchComplaints, createBugReportService, getAllBugReportsService, updateBugStatusService, getNotificationSettingsService, updateNotificationSettingsService,
  getEmployeeFeedback, getEmployeeFeedbackById, getEmployeeFeedbackByRating, getFrequentEmployeeRatings, updateEmployeeFeedback, deleteEmployeeFeedback, getConsultantFeedback, getConsultantFeedbackById,
  getConsultantFeedbackByRating, getFrequentConsultantRatings, updateConsultantFeedback, deleteConsultantFeedback,
}