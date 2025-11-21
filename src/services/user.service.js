// ======================================================================
// CLEAN VERSION USING getModel()
// ======================================================================

import { publishToCentrifugo } from "../centrifugo/centrifugoClient.js";
import { girirajModels } from "../db/index.js";
import { sendNotification } from "../utils/sendNotification.js";
import { sendWhatsAppMessage } from "../utils/sendWhatsAppMessage.js";

// ------------------------------------------------------------------
// REUSABLE getModel()
// ------------------------------------------------------------------
function getModel(modelName) {
  if (!girirajModels || typeof girirajModels !== "object") {
    throw new Error("girirajModels not initialized");
  }

  const keys = Object.keys(girirajModels);

  const target = modelName.toLowerCase();

  const foundKey = keys.find(
    (k) =>
      k.toLowerCase() === target || k.toLowerCase().includes(target)
  );

  if (!foundKey) {
    throw new Error(`Model not found: ${modelName}`);
  }

  let model = girirajModels[foundKey];

  if (model && typeof model.find !== "function") {
    model = model.primary || model.secondary || model.default || model.model;
  }

  if (!model || typeof model.find !== "function") {
    throw new Error(`Invalid Mongoose model: ${modelName}`);
  }

  return model;
}

// 📌 MODEL SHORTCUTS
const IPDPatient = () => getModel("GIRIRAJIPDPatients");
const InternalComplaint = () => getModel("GIRIRAJInternalComplaint");
const IPDConcern = () => getModel("GIRIRAJIPDConcern");
const OPDPatient = () => getModel("GIRIRAJOpd");
const OPDConcern = () => getModel("GIRIRAJOPDConcern");
const User = () => getModel("GIRIRAJUser");
const Doctor = () => getModel("GIRIRAJDoctor");
const EmployeeFeedback = () => getModel("GIRIRAJEmployeeFeedback");
const ConsultantFeedback = () => getModel("GIRIRAJConsultantFeedback");
const NotificationSetting = () => getModel("GIRIRAJNotificationSetting");
const Notification = () => getModel("GIRIRAJNotification");
const Complaint = () => getModel("GIRIRajComplaints");

// ======================================================================
// CREATE COMPLAINT
// ======================================================================
const createComplaint = async (data) => {
  return await Complaint().create(data);
};

// ======================================================================
// CREATE IPD PATIENT (FULLY FIXED)
// ======================================================================
const createIPDPatient = async (payload, io) => {
  const { showInStackBar = true, userId, userModel } = payload;

  const patient = await IPDPatient().create(payload);

  const populated = await IPDPatient()
    .findById(patient._id)
    .populate("consultantDoctorName", "name qualification")
    .lean();

  if (populated.contact) {
    await sendWhatsAppMessage({
      phoneNumber: populated.contact,
      patientName: populated.patientName,
    }).catch(console.error);
  }

  let settings = null;
  if (userId && userModel) {
    settings = await NotificationSetting().findOne({ userId, userModel });
  }

  const allowSocket = showInStackBar && (settings?.ipd ?? true);

  if (io && allowSocket) {
    io.emit("ipd:new", {
      patientName: populated.patientName,
      bedNo: populated.bedNo,
      consultantDoctorName:
        populated?.consultantDoctorName?.name || "N/A",
      createdAt: populated.createdAt,
    });
  }

  await Notification().create({
    title: "IPD",
    body: `Patient ${populated.patientName} (Bed ${populated.bedNo}) add a feedback.`,
    data: {
      patientName: populated.patientName,
      bedNo: populated.bedNo,
      consultantDoctorName:
        populated?.consultantDoctorName?.name || "N/A",
    },
    department: "IPD",
    showInStackBar,
    status: allowSocket ? "sent" : "saved",
  });

  return populated;
};

// ======================================================================
// CREATE IPD CONCERN (FULL getModel version)
// ======================================================================
const createIPDConcern = async (payload, io) => {
  console.log("📥 Incoming IPD Concern Payload:", payload);

  // 1️⃣ Create concern
  const concern = await IPDConcern().create(payload);
  console.log("🆕 Concern created with ID:", concern._id);

  // 2️⃣ Populate doctor
  const populated = await IPDConcern()
    .findById(concern._id)
    .populate("consultantDoctorName", "name qualification")
    .lean();

  console.log("👤 Populated Concern:", populated);

  // 3️⃣ WhatsApp message
  if (populated.contact) {
    console.log("📞 Sending WhatsApp to:", populated.contact);
    await sendWhatsAppMessage({
      phoneNumber: populated.contact,
      patientName: populated.patientName,
    }).catch((err) => console.error("❌ WhatsApp Error:", err));
  }

  // 4️⃣ Live socket broadcast
  if (io) {
    console.log("📡 Emitting socket event: ipd:complaint");
    io.emit("ipd:complaint", {
      patientName: populated.patientName,
      bedNo: populated.bedNo,
      consultantDoctorName: populated?.consultantDoctorName?.name || "N/A",
      createdAt: populated.createdAt,
    });
  }

  // 5️⃣ Determine involved departments
  const DEPTS = [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "nursing",
  ];

  const MODULE_MAP = {
    doctorServices: "doctor_service",
    billingServices: "billing_service",
    housekeeping: "housekeeping_service",
    maintenance: "maintenance_service",
    diagnosticServices: "diagnostic_service",
    dietitianServices: "dietitian_service",
    security: "security_service",
    nursing: "nursing_service",
  };

  const formatDeptLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/services?/gi, " Services")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  const involved = DEPTS.filter((key) => {
    const block = populated[key];
    return (
      block &&
      ((block.text && block.text.trim()) ||
        (Array.isArray(block.attachments) && block.attachments.length > 0))
    );
  });

  console.log("🏥 Involved Departments:", involved);

  // 6️⃣ Send FCM Notifications
  for (const dept of involved) {
    const label = formatDeptLabel(dept);
    const topic = `hospital-${MODULE_MAP[dept]}`;

    const messageData = {
      complaintId: populated._id.toString(),
      patientName: populated.patientName,
      bedNo: String(populated.bedNo || ""),
      consultantDoctorName:
        populated?.consultantDoctorName?.name || "N/A",
      department: label,
      module: MODULE_MAP[dept],
      sound: "default",
    };

    const message = {
      title: "New Complaint Added",
      body: `Patient ${populated.patientName} raised a complaint in ${label}.`,
      topic,
      data: messageData,
    };

    console.log("🔔 Sending FCM Notification →");
    console.log(JSON.stringify(message, null, 2));

    await sendNotification(message).catch((err) =>
      console.error("❌ FCM Error:", err)
    );
  }

  // 7️⃣ Save DB Notification
  const dbNotification = await Notification().create({
    title: "Complaint Registered",
    body: `Patient ${populated.patientName} raised a complaint.`,
    data: {
      complaintId: populated._id.toString(),
      patientName: populated.patientName,
      bedNo: populated.bedNo,
    },
    department: "IPD",
    status: "sent",
  });

  console.log("📝 Notification saved to DB:", dbNotification);

  return populated;
};


// ======================================================================
// CREATE INTERNAL COMPLAINT
// ======================================================================
const createInternalComplaint = async (payload, io) => {
  const internal = await InternalComplaint().create(payload);

  const populated = await InternalComplaint()
    .findById(internal._id)
    .lean();

  if (io) {
    io.emit("internal:complaint", {
      employeeName: populated.employeeName,
      employeeId: populated.employeeId,
      floorNo: populated.floorNo,
      createdAt: populated.createdAt,
    });
  }

  return populated;
};

// ======================================================================
// CREATE OPD PATIENT
// ======================================================================
const createOPDPatient = async (payload, io) => {
  const { showInStackBar = true, userId, userModel } = payload;

  const opd = await OPDPatient().create(payload);

  const populated = await OPDPatient()
    .findById(opd._id)
    .populate("consultantDoctorName", "name qualification")
    .lean();

  if (populated.contact) {
    await sendWhatsAppMessage({
      phoneNumber: populated.contact,
      patientName: populated.patientName,
    }).catch(console.error);
  }

  let settings = null;
  if (userId && userModel) {
    settings = await NotificationSetting().findOne({ userId, userModel });
  }

  const allow = showInStackBar && (settings?.opd ?? true);

  if (io && allow) {
    io.emit("opd:new", {
      patientName: populated.patientName,
      consultantDoctorName:
        populated?.consultantDoctorName?.name || "N/A",
      createdAt: populated.createdAt,
    });
  }

  await Notification().create({
    title: "OPD",
    body: `Patient ${populated.patientName} has added a feedback.`,
    data: {
      patientName: populated.patientName,
      consultantDoctorName:
        populated?.consultantDoctorName?.name || "N/A",
    },
    department: "OPD",
    status: allow ? "sent" : "saved",
  });

  return populated;
};

// ======================================================================
// OPD CONCERN
// ======================================================================
const createOPDConcern = async (payload) => {
  return await OPDConcern().create(payload);
};

// ======================================================================
// USER
// ======================================================================
const getUserByEmail = async (email) => {
  return await User().findOne({ email });
};

// ======================================================================
// DOCTORS
// ======================================================================
const getDoctors = async () => {
  return await Doctor().find().sort({ createdAt: -1 });
};

// ======================================================================
// EMPLOYEE FEEDBACK
// ======================================================================
const createEmployeeFeedback = async (payload, io) => {
  const feedback = await EmployeeFeedback().create(payload);

  const populated = await EmployeeFeedback()
    .findById(feedback._id)
    .lean();

  if (io) {
    io.emit("employeeFeedback:new", {
      employeeName: populated.employeeName,
      employeeId: populated.employeeId,
      createdAt: populated.createdAt,
    });
  }

  await Notification().create({
    title: "Employee Feedback Received",
    body: `New feedback from ${populated.employeeName}.`,
    department: "HR",
    status: "sent",
  });

  return populated;
};

// ======================================================================
// CONSULTANT FEEDBACK
// ======================================================================
const createConsultantFeedback = async (payload, io) => {
  const feedback = await ConsultantFeedback().create(payload);

  const populated = await ConsultantFeedback()
    .findById(feedback._id)
    .lean();

  if (io) {
    io.emit("consultantFeedback:new", {
      doctorName: populated.doctorName,
      createdAt: populated.createdAt,
    });
  }

  await Notification().create({
    title: "Consultant Feedback Received",
    body: `New feedback submitted by Dr. ${populated.doctorName}.`,
    department: "Management",
    status: "sent",
  });

  return populated;
};

export default {
  createComplaint, createIPDPatient, createOPDPatient, createIPDConcern, createOPDConcern, getUserByEmail, getDoctors, createInternalComplaint, createEmployeeFeedback, createConsultantFeedback,
};
