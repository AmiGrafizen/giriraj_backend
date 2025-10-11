import { girirajModels } from "../db/giriraj.db.js";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { sendNotification } from "../utils/sendNotification.js";
import { extractDepartment } from "../utils/extractDepartment.js";

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

function hasConcern(item) {
  if (!item) return false;
  if (item.text && String(item.text).trim()) return true;
  if (Array.isArray(item.attachments) && item.attachments.length) return true;
  if (item.topic && String(item.topic).trim()) return true;
  return false;
}

async function countConcernsInRange({ start, end }) {
  const docs = await girirajModels.GIRIRAJIPDPatients
    ?.find({ createdAt: { $gte: start, $lte: end } })
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
  const [patients, total] = await Promise.all([
    girirajModels.GIRIRAJIPDPatients.find()
      .select(
        "patientName bedNo contact consultantDoctorName ratings comments overallRecommendation createdAt"
      )
      .populate("consultantDoctorName", "name qualification")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    girirajModels.GIRIRAJIPDPatients.countDocuments(),
  ]);

  return {
    patients,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

const getIPDPatientById = async (id) => {
  const patient = await girirajModels.GIRIRAJIPDPatients?.findById(id)
    .select(
      "patientName contact bedNo language consultantDoctorName ratings comments overallRecommendation createdAt updatedAt"
    )
    .populate("consultantDoctorName", "name qualification")
    .lean();

  console.log("patient", patient);

  if (!patient) return null;

  return patient; // ✅ must return
};


const deleteIPDPatientById = async (id) => {
  return await girirajModels.GIRIRAJIPDPatients?.findByIdAndDelete(id);
}

const updateIPDPatientById = async (id, update) => {
  const patient = await girirajModels.GIRIRAJIPDPatients?.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;

};

async function getIPDPatientByRating() {
  const feedbacks = await girirajModels.GIRIRAJIPDPatients?.find();

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

const getIPDConcern = async () => {
  return await girirajModels.GIRIRAJIPDConcern?.find().populate("consultantDoctorName").sort({ createdAt: -1 }).lean();;
}
const getIPDPaConcernById = async (id) => {
  return await girirajModels.GIRIRAJIPDConcern?.findById(id).populate("consultantDoctorName").lean();;
}
const deleteIPDConcernById = async (id) => {
  return await girirajModels.GIRIRAJIPDConcern?.findByIdAndDelete(id);
}

const updateIPDConcernById = async (id, update) => {
  const patient = await girirajModels.GIRIRAJIPDConcern?.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

const createOPDPatient = async (payload) => {
  return await girirajModels.GIRIRAJOpd?.create(payload);
};

const getOPDPatients = async () => {
  return await girirajModels.GIRIRAJOpd?.find().populate("consultantDoctorName").sort({ createdAt: -1 });
}

const getOPDPatientById = async (id) => {
  return await girirajModels.GIRIRAJOpd?.findById(id).populate("consultantDoctorName");
}

const deleteOPDPatientById = async (id) => {
  return await girirajModels.GIRIRAJOpd?.findByIdAndDelete(id);
}

const updateOPDPatientById = async (id, update) => {
  const patient = await girirajModels.GIRIRAJOpd?.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

async function getOPDPatientByRating() {
  const feedbacks = await girirajModels.GIRIRAJOpd?.find();

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
  return await girirajModels.GIRIRajComplaints?.findOne({ ticketId });
};

const updateComplaint = async (ticketId, updates) => {
  return await girirajModels?.GIRIRajComplaints?.findOneAndUpdate({ ticketId }, updates, { new: true });
};

const getAllComplaints = async () => {
  return await girirajModels?.GIRIRajComplaints?.find();
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
  return await girirajModels?.GIRIRAJRole?.create(data);
};

const getAllRoles = async () => {
  return await girirajModels?.GIRIRAJRole?.find();
};

const getRoleById = async (id) => {
  return await girirajModels?.GIRIRAJRole?.findById(id);
};

const updateRole = async (id, data) => {
  return await girirajModels?.GIRIRAJRole?.findByIdAndUpdate(id, data, { new: true });
};

const deleteRole = async (id) => {
  return await girirajModels?.GIRIRAJRole?.findByIdAndDelete(id);
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

  const role = await girirajModels?.GIRIRAJRole?.findById(roleId);
  if (!role) {
    throw new Error("Invalid roleId. Role not found.");
  }

  const existingUser = await girirajModels?.GIRIRAJRoleUser?.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await girirajModels?.GIRIRAJRoleUser?.create({
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
  return await girirajModels?.GIRIRAJRoleUser?.find().populate("roleId");
};

const getRoleUserById = async (id) => {
  return await girirajModels?.GIRIRAJRoleUser?.findById(id).populate("roleId");
};

const updateRoleUser = async (id, data) => {
  return await girirajModels?.GIRIRAJRoleUser?.findByIdAndUpdate(id, data, { new: true });
};

const deleteRoleUser = async (id) => {
  return await girirajModels?.GIRIRAJRoleUser?.findByIdAndDelete(id);
};


// const forwardConcernToDepartment = async (concernId, department, data, userId) => {
//   if (!CONCERN_KEYS.includes(department)) {
//     throw new Error("Invalid department name");
//   }

//   const concern = await girirajModels?.GIRIRAJIPDConcern.findById(concernId);
//   if (!concern) {
//     throw new Error("Concern not found");
//   }

//   // ✅ Save department data
//   concern[department] = {
//     ...data,
//   };

//   // ✅ Track forward history
//   concern.forwards.push({
//     toDepartment: department,
//     note: data.note || "",
//     forwardedBy: userId || null,
//     forwardedAt: new Date(),
//   });

//   // ✅ Update status when forwarded
//   concern.status = "forwarded";

//   await concern.save();
//   return concern;
// };

const forwardConcernToDepartment = async (concernId, department, data, userId) => {
  if (!CONCERN_KEYS.includes(department)) {
    throw new Error("Invalid department name");
  }

  const concern = await girirajModels?.GIRIRAJIPDConcern.findById(concernId);
  if (!concern) {
    throw new Error("Concern not found");
  }

  concern[department] = { ...data };

  concern.forwards.push({
    toDepartment: department,
    note: data.note || "",
    forwardedBy: userId || null,
    forwardedAt: new Date(),
  });

  concern.status = "forwarded";
  await concern.save();

  const deptName = extractDepartment(concern) || department;

  const roleUsers = await girirajModels.GIRIRAJRoleUser.find({
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

  return await girirajModels?.GIRIRAJIPDConcern.find({
    [department]: { $exists: true, $ne: null },
  }).populate("consultantDoctorName");
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
  const { start, end } = parseRange(range);

  const [opd, ipd] = await Promise.all([
    girirajModels.GIRIRAJOpd.find({ createdAt: { $gte: start, $lte: end } })
      .select("patientName contact consultantDoctorName doctorName ratings comments overallRecommendation createdAt")
      .populate("consultantDoctorName", "name qualification") // ✅ doctor populated here
      .lean(),

    girirajModels.GIRIRAJIPDPatients.find({ createdAt: { $gte: start, $lte: end } })
      .select("patientName contact consultantDoctorName doctorName ratings comments overallRecommendation createdAt")
      .populate("consultantDoctorName", "name qualification") // ✅ doctor populated here
      .lean(),
  ]);

  const rows = [];

  for (const d of opd) {
    rows.push({
      type: "OPD",
      ...d,
      consultantDoctorName: d.consultantDoctorName || { name: d.doctorName || "-", qualification: "" },
      avgRating: avgFromRatings(d.ratings, OPD_KEYS),
    });
  }

  for (const d of ipd) {
    rows.push({
      type: "IPD",
      ...d,
      consultantDoctorName: d.consultantDoctorName || { name: d.doctorName || "-", qualification: "" },
      avgRating: avgFromRatings(d.ratings, IPD_KEYS),
    });
  }

  return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


// --- helper to normalize doctor info ---
async function normalizeDoctor(value, fallback) {
  if (!value) return { name: fallback || "-", qualification: "" };

  // If value is already populated ObjectId (with doctor fields)
  if (typeof value === "object" && value.name) {
    return { name: value.name, qualification: value.qualification || "" };
  }

  // If value is a plain ObjectId (not populated yet)
  if (/^[0-9a-fA-F]{24}$/.test(String(value))) {
    const doc = await girirajModels.GIRIRAJDoctor.findById(value)
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

async function getKpis(range) {
  const { start, end } = parseRange(range);

  const curr = await loadFeedbackWindow({ from: start, to: end });

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
    const avgOpd = b.opd.length ? r1(b.opd.reduce((s, x) => s + x, 0) / b.opd.length) : 0;
    const avgIpd = b.ipd.length ? r1(b.ipd.reduce((s, x) => s + x, 0) / b.ipd.length) : 0;

    opdSeries.push(avgOpd);
    ipdSeries.push(avgIpd);
  }

  // NPS
  const npsResponses = curr.map(r => r.overallRecommendation).filter(x => x != null);
  const promoters = npsResponses.filter(x => x >= 9).length;
  const detractors = npsResponses.filter(x => x <= 6).length;
  const totalNpsResponses = npsResponses.length;
  const npsPercentage = totalNpsResponses
    ? r1(((promoters - detractors) / totalNpsResponses) * 100)
    : 0;

  // Concerns
  const concerns = await girirajModels.GIRIRAJIPDConcern.find({
    createdAt: { $gte: start, $lte: end }
  }).select("status").lean();

  const totalConcern = concerns.length;
  const openIssues = concerns.filter(c => ["open", "Open", "in_progress", "In Progress"].includes(c.status)).length;
  const resolvedIssues = concerns.filter(c => ["resolved", "Resolved"].includes(c.status)).length;

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
    earning: {
      weeklyAverage: ipdSeries.filter(x => x > 0).length
        ? r1(ipdSeries.reduce((s, x) => s + x, 0) / ipdSeries.filter(x => x > 0).length)
        : 0,
      series: ipdSeries,
      labels,
    },
    expense: {
      weeklyAverage: opdSeries.filter(x => x > 0).length
        ? r1(opdSeries.reduce((s, x) => s + x, 0) / opdSeries.filter(x => x > 0).length)
        : 0,
      series: opdSeries,
      labels,
    },
  };
}


async function getIpdTrends(range) {
  const { start, end } = parseRange(range);
  const rows = await girirajModels.GIRIRAJIPDPatients.find({
    createdAt: { $gte: start, $lte: end },
  })
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

  let concerns = [];

  if (loginType?.toLowerCase() === "admin") {
    // ✅ Fetch all concerns (ignore date range)
    concerns = await girirajModels.GIRIRAJIPDConcern.find({})
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
  concerns = await girirajModels.GIRIRAJIPDConcern.find({
    createdAt: { $gte: start, $lte: end },
  })
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

  // --- 1️⃣ Fetch complaints (with fallback department extraction)
  const rawComplaints = await girirajModels.GIRIRAJIPDConcern
    ?.find({ createdAt: { $gte: start, $lte: end } })
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
  const IPDModel =
    girirajModels?.GIRIRAJIPDPatients;

  const OPDModel =
    girirajModels?.GIRIRAJOpds;

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


async function getDashboard({ from, to, modules = [], loginType }) {
  const [kpis, ipdTrends, opdSatisfaction, concerns, dept, recent, daily] =
    await Promise.all([
      getKpis({ from, to }),
      getIpdTrends({ from, to }),
      getOpdSatisfaction({ from, to }),
      getConcerns({ from, to, modules, loginType }),         // 👈 pass loginType here
      getDepartmentAnalysis({ from, to, modules, loginType }), // 👈 pass loginType here
      getRecentFeedbacks({ from, to }, 6),
      getDailyFeedback({ from, to }),
    ]);

  return {
    kpis,
    ipdTrends,
    opdSatisfaction,
    concerns,
    departmentAnalysis: dept,
    recentFeedbacks: recent,
    dailyFeedback: daily,
  };
}



const escalateConcern = async (concernId, { level, note, userId }) => {
  const concern = await girirajModels?.GIRIRAJIPDConcern.findById(concernId);
  if (!concern) throw new Error("Concern not found");

  // 1. Add escalation entry
  const escalation = {
    level,
    note,
    escalatedBy: userId,
    escalatedAt: new Date(),
  };
  concern.escalations.push(escalation);
  concern.status = "escalated";
  await concern.save();

  // 2. Map escalation level to role
  const escalationRoleMap = {
    PGRO: "pgro",
    CEO: "ceo",
    "Medical Director": "medical_director",
    "Board of Directors": "board",
  };

  const roleKey = escalationRoleMap[level];

  // 3. Fetch target users
  let targetUsers = [];
  if (roleKey) {
    targetUsers = await girirajModels.GIRIRAJUser.find({ role: roleKey })
      .select("deviceToken email")
      .lean();
  }

  // Always notify admins too
  const admins = await girirajModels.GIRIRAJUser.find({ role: "admin" })
    .select("deviceToken email")
    .lean();

  const allRecipients = [...admins, ...targetUsers];

  // 4. Push Notification
  const tokens = allRecipients.map((u) => u.deviceToken).filter(Boolean);
  if (tokens.length > 0) {
    await sendNotification({
      tokens,
      title: `⚠️ Concern Escalated to ${level}`,
      body: `Patient ${concern.patientName || "N/A"} concern has been escalated.`,
      data: {
        concernId: String(concern._id),
        level,
        type: "IPD_CONCERN_ESCALATED",
      },
    });
  }

  // 5. Email Notification (optional)
  // for (const u of allRecipients) {
  //   if (u.email) {
  //     await sendEmail({
  //       to: u.email,
  //       subject: `Concern Escalated to ${level}`,
  //       text: `Concern for patient ${concern.patientName} has been escalated to ${level}. \n\nNote: ${note}`,
  //     });
  //   }
  // }

  return concern;
};

const resolveConcern = async (concernId, { note, proof, userId }) => {
  const concern = await girirajModels?.GIRIRAJIPDConcern.findById(concernId);
  if (!concern) throw new Error("Concern not found");

  // 1. Mark concern as resolved
  concern.resolution = {
    note,
    proof,
    resolvedBy: userId,
    resolvedAt: new Date(),
  };
  concern.status = "resolved";
  await concern.save();

  // 2. Notify admins + dept users via FCM
  const department = extractDepartment(concern);

  const admins = await girirajModels.GIRIRAJUser.find({ role: "admin" })
    .select("deviceToken")
    .lean();

  let deptUsers = [];
  if (department) {
    deptUsers = await girirajModels.GIRIRAJUser.find({
      role: "user",
      department: department,
    })
      .select("deviceToken")
      .lean();
  }

  const tokens = [
    ...admins.map((u) => u.deviceToken),
    ...deptUsers.map((u) => u.deviceToken),
  ].filter(Boolean);

  if (tokens.length > 0) {
    await sendNotification({
      tokens,
      title: "Concern Resolved",
      body: `Concern for patient ${
        concern.patientName || "Unknown"
      } has been resolved.`,
      data: {
        concernId: String(concern._id),
        department: department || "General",
        type: "IPD_CONCERN_RESOLVED",
      },
    });
  }

  /**
   * ------------------------------------------
   * 📲 WhatsApp Message to Patient
   * ------------------------------------------
   */
  if (concern.contact) {
    try {
      await sendResolveMessage({
        phoneNumber: concern.contact,
        patientName: concern.patientName || "Patient",
      });
    } catch (err) {
      console.error(
        "❌ WhatsApp message failed:",
        err.response?.data || err.message
      );
    }
  } else {
    console.warn("⚠️ Concern has no patient contact. WhatsApp skipped.");
  }

  return concern;
};

function hasValidData(deptData) {
  if (!deptData) return false;

  const obj = deptData.toObject ? deptData.toObject() : deptData;

  const hasText = obj.text && obj.text.trim() !== "";
  const hasAttachments = Array.isArray(obj.attachments) && obj.attachments.length > 0;

  return hasText || hasAttachments;
}

const getConcernHistory = async (concernId) => {
  const concern = await girirajModels?.GIRIRAJIPDConcern.findById(concernId)
    .populate("escalations.escalatedBy", "name email")
    .populate("resolution.resolvedBy", "name email")
    .populate("forwards.forwardedBy", "name email")
    .populate("progress.updatedBy", "name email");

  if (!concern) throw new Error("Concern not found");

  const history = [];
  const forwardedDepartments = [];

  // 🔹 Complaint Created
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

  // 🔹 Forwards
  concern.forwards.forEach((fwd) => {
    forwardedDepartments.push(fwd.toDepartment);
    history.push({
      type: "forwarded",
      label: `Forwarded to ${fwd.toDepartment}`,
      note: fwd.note,
      by: fwd.forwardedBy,
      at: fwd.forwardedAt,
    });
  });

  // 🔹 Escalations
  concern.escalations.forEach((esc) => {
    history.push({
      type: "escalated",
      label: `Escalated to ${esc.level}`,
      note: esc.note,
      by: esc.escalatedBy,
      at: esc.escalatedAt,
    });
  });

  // 🔹 Progress Update (single object)
  if (concern.progress) {
    history.push({
      type: "in_progress",
      label: "Progress Update",
      note: concern.progress.note,
      by: concern.progress.updatedBy,
      at: concern.progress.updatedAt,
    });
  }

  // 🔹 Resolution
  if (concern.resolution) {
    history.push({
      type: "resolved",
      label: "Resolved",
      note: concern.resolution.note,
      proof: concern.resolution.proof,
      by: concern.resolution.resolvedBy,
      at: concern.resolution.resolvedAt,
    });
  }

  // ✅ Sort chronologically
  const timeline = history.sort(
    (a, b) => new Date(a.at || a.createdAt) - new Date(b.at || b.createdAt)
  );

  return {
    concernId: concern._id,
    forwardedDepartments,
    timeline,
  };
};


const updateProgressRemarkService = async (complaintId, updateNote, userId) => {
  const updatedConcern = await girirajModels?.GIRIRAJIPDConcern.findOneAndUpdate(
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
  ).populate("progress.updatedBy", "name email");

  if (!updatedConcern) throw new Error("Concern not found");

  const deptUsers = await girirajModels.GIRIRAJRoleUser.find({
    $or: [
      { department: "Admin" },
      { departments: { $in: ["Admin"] } },
    ],
  })
    .populate({ path: "user", select: "fcmTokens name" })
    .lean();

  const tokens = [];
  for (const du of deptUsers) {
    if (du?.user?.fcmTokens) tokens.push(...du.user.fcmTokens);
    if (du?.fcmTokens) tokens.push(...du.fcmTokens);
  }

  if (tokens.length > 0) {
    await sendNotification({
      tokens,
      title: "Progress Updated",
      body: `Concern ${updatedConcern.complaintId} marked In-Progress: ${updateNote}`,
      data: {
        concernId: updatedConcern._id.toString(),
        complaintId: updatedConcern.complaintId,
        status: updatedConcern.status,
      },
    });
  }

  return updatedConcern;
};

const createDoctor = async (payload) => {
  return await girirajModels.GIRIRAJDoctor?.create(payload);
};

const getDoctors = async () => {
  return await girirajModels.GIRIRAJDoctor?.find().sort({ createdAt: -1 });
}

const getDoctorById = async (id) => {
  return await girirajModels.GIRIRAJDoctor?.findById(id);
}
const deleteDoctor = async (id) => {
  return await girirajModels.GIRIRAJDoctor?.findByIdAndDelete(id);
}

const updateDoctor = async (id, update) => {
  const patient = await girirajModels.GIRIRAJDoctor?.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

const sendAndSaveNotification = async ({ tokens, title, body, data = {}, role, sentTo = [] }) => {
  try {
    if (!tokens || tokens.length === 0) {
      console.log("⚠️ No device tokens available to send notification.");
      return { success: false, error: "No tokens" };
    }

    const message = {
      tokens,
      notification: { title, body },
      data,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // ✅ Save into DB
    const savedNotification = await girirajModels?.GIRIRAJNotification.create({
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
  return await girirajModels?.GIRIRAJNotification.find().sort({ createdAt: -1 });
};

async function getAllComplaintDetails() {
  const concerns = await girirajModels?.GIRIRAJIPDConcern?.find()
    .populate("consultantDoctorName", "name")
    .populate("resolution.resolvedBy", "name email")
    .lean();

  const resolvedConcerns = concerns.filter(c => c.resolution?.resolvedAt);

  return resolvedConcerns.map(concern => {
    const departments = [];
    Object.keys(DEPT_LABEL).forEach(dep => {
      if (concern[dep] && (concern[dep].text || (concern[dep].attachments?.length > 0))) {
        departments.push({
          department: DEPT_LABEL[dep] || dep,
          text: concern[dep].text || null,
          attachments: concern[dep].attachments || [],
        });
      }
    });

    // ✅ calculate TAT
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
      complaintId: concern.complaintId,
      patientName: concern.patientName,
      contact: concern.contact || "-",
      bedNo: concern.bedNo || "-",
      doctor: concern.consultantDoctorName?.name || "-",
      status: concern.status,
      priority: concern.priority,
      note: concern.note || "-",

      // formatted times
      stampIn:concern.createdAt,
      stampOut:concern.resolution?.resolvedAt,
      totalTimeTaken: totalTime,

      // complaint departments
      departments,

      // resolution details
      resolution: {
        note: concern.resolution?.note || null,
        proof: concern.resolution?.proof || [],
        resolvedBy: concern.resolution?.resolvedBy?.name || "-",
      },
    };
  });
}

const createBed = async (payload) => {
  return await girirajModels.GIRIRAJBed?.create(payload);
};

const getBeds = async () => {
  return await girirajModels.GIRIRAJBed?.find().sort({ createdAt: -1 });
}

const getBedById = async (id) => {
  return await girirajModels.GIRIRAJBed?.findById(id);
}
const deleteBed = async (id) => {
  return await girirajModels.GIRIRAJBed?.findByIdAndDelete(id);
}

const updatedBed = async (id, update) => {
  const patient = await girirajModels.GIRIRAJBed?.findByIdAndUpdate(id, update, { new: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

const validateBedNumber = async (bedNo) => {
  if (isNaN(bedNo)) {
    return { valid: false, message: "Invalid bed number" };
  }

  const bedWard = await girirajModels?.GIRIRAJBed?.findOne({
    start: { $lte: bedNo },
    end: { $gte: bedNo },
  });

  if (bedWard) {
    return { valid: true, ward: bedWard.wardName };
  } else {
    return { valid: false, message: "This bed number is not available" };
  }
};

 const getComplaintSummary = async () => {
  const complaints = await girirajModels?.GIRIRAJIPDConcern.find({}).lean();
  const beds = await girirajModels?.GIRIRAJBed.find({}).lean();

  const wardCounts = {};

  complaints.forEach((c) => {
    const bedNo = parseInt(c.bedNo, 10);
    if (!bedNo || isNaN(bedNo)) return;

    const ward = beds.find(b => bedNo >= b.start && bedNo <= b.end);

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
}

async function getServiceWiseSummary() {
  const complaints = await girirajModels?.GIRIRAJIPDConcern.find({}).lean();

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
  const patients = await girirajModels?.GIRIRAJIPDPatients?.find({}, { ratings: 1 }).lean();

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

  // Fetch all OPD feedback
  const feedbacks = await girirajModels?.GIRIRAJOpd.find({}, { ratings: 1 });

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


export default {
  createIPDPatient, getIPDPatientById, getIPDPatients, deleteIPDPatientById, updateIPDPatientById, createComplaint, getComplaintById, updateComplaint, getAllComplaints,
  createOPDPatient, getOPDPatientById, getOPDPatients, updateOPDPatientById, deleteOPDPatientById, getComplaintStatsByDepartment, getIPDPatientByRating, getOPDPatientByRating,
  createRole, getAllRoles, getRoleById, updateRole, deleteRole, createRoleUser, getAllRoleUsers, getRoleUserById, updateRoleUser, deleteRoleUser, getDashboard, createIPDConcern, getIPDConcern,
  getIPDPaConcernById, updateIPDConcernById, deleteIPDConcernById, forwardConcernToDepartment, getConcernsByDepartment, escalateConcern, resolveConcern, getConcernHistory, updateProgressRemarkService,
  createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, sendAndSaveNotification, getAllNotificationsService, getAllComplaintDetails, createBed, getBedById, getBeds,
  updatedBed, deleteBed, validateBedNumber, getComplaintSummary, getServiceWiseSummary, getFrequentRatingKeywords, getFrequentOPDRatings,
}