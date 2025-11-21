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
  // 1️⃣ Create complaint
  const complaint = await IPDConcern()?.create(payload);
  if (!complaint) {
    console.error("Failed to create Complaint");
    return null;
  }

  // 2️⃣ Populate doctor info
  const populatedComplaint = await IPDConcern()?.findById(
    complaint._id
  )
    .populate("consultantDoctorName", "name qualification")
    .lean();

  console.log("IPD complaint created:", populatedComplaint.patientName);

  // 3️⃣ WhatsApp message
  if (populatedComplaint.contact) {
    try {
      await sendWhatsAppMessage({
        phoneNumber: populatedComplaint.contact,
        patientName: populatedComplaint.patientName,
      });
      console.log("✅ WhatsApp message sent to patient");
    } catch (err) {
      console.error("❌ WhatsApp failed:", err.response?.data || err.message);
    }
  }

  // 4️⃣ Socket.IO broadcast
  try {
    if (io) {
      io.emit("ipd:complaint", {
        patientName: populatedComplaint.patientName,
        bedNo: populatedComplaint.bedNo,
        consultantDoctorName:
          populatedComplaint?.consultantDoctorName?.name || "N/A",
        contact: populatedComplaint.contact || null,
        createdAt: populatedComplaint.createdAt,
      });
      console.log("📢 Complaint broadcasted via Socket.IO");
    }
  } catch (err) {
    console.error("❌ Socket.IO emit failed:", err.message);
  }

  // 5️⃣ Department constants
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

  // ✅ Helper for readable labels
  const formatDeptLabel = (key = "") =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/services?/i, " Services")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  const DEPT_LABEL = {};
  for (const key of DEPT_KEYS) {
    DEPT_LABEL[key] = formatDeptLabel(key);
  }

  // 6️⃣ Determine involved departments
  let involvedDepartments = [];

  if (payload?.loginType === "admin") {
    console.log("🟢 Admin detected — single complaint-wide notification");
  } else {
    involvedDepartments = DEPT_KEYS.filter((key) => {
      const block = populatedComplaint[key];
      if (!block) return false;
      const hasText = block.text && String(block.text).trim().length > 0;
      const hasAttachments =
        Array.isArray(block.attachments) && block.attachments.length > 0;
      return hasText || hasAttachments;
    });
  }

  // 7️⃣ Prevent duplicate notifications
  const cacheKey = `fcm_sent_${populatedComplaint._id}`;
  if (global[cacheKey]) {
    console.log("⚠️ Duplicate complaint notification skipped:", cacheKey);
    return populatedComplaint;
  }
  global[cacheKey] = true;
  setTimeout(() => delete global[cacheKey], 60000);

  // 8️⃣ Send Notifications
  try {
    if (payload?.loginType === "admin") {
      // 🚀 SINGLE notification for admin
      const topicName = `hospital-all`;
      const title = "New Complaint Added";
      const body = `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a new complaint covering all departments.`;

      // 🔔 FCM notification
      await sendNotification({
        title,
        body,
        topic: topicName,
        data: {
          complaintId: populatedComplaint._id?.toString(),
          patientName: populatedComplaint.patientName,
          bedNo: populatedComplaint.bedNo,
          consultantDoctorName:
            populatedComplaint?.consultantDoctorName?.name || "N/A",
          department: "All Departments",
          module: "global_complaint",
        },
      });
      console.log(`📨 FCM sent to topic: ${topicName}`);

      // ⚡ Centrifugo broadcast
      await publishToCentrifugo(topicName, {
        type: "new_complaint",
        title,
        message: body,
        patientName: populatedComplaint.patientName,
        bedNo: populatedComplaint.bedNo,
        consultantDoctorName:
          populatedComplaint?.consultantDoctorName?.name || "N/A",
        department: "All Departments",
        createdAt: populatedComplaint.createdAt,
      });
      console.log(`📡 Centrifugo event pushed to channel: ${topicName}`);
    } else {
      // 🚀 Department-wise notifications
      for (const deptKey of involvedDepartments) {
        const moduleName = MODULE_MAP[deptKey];
        const label = DEPT_LABEL[deptKey] || formatDeptLabel(deptKey);
        const topicName = `hospital-${moduleName}`;

        // ✅ Human-friendly body text
        const body = `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a complaint in ${label}.`;

        // 🔔 FCM notification
        await sendNotification({
          title: "New Complaint Added",
          body,
          topic: topicName,
          data: {
            complaintId: populatedComplaint._id?.toString(),
            patientName: populatedComplaint.patientName,
            bedNo: String(populatedComplaint.bedNo || ""),
            consultantDoctorName:
              populatedComplaint?.consultantDoctorName?.name || "N/A",
            department: label,
            module: moduleName,
            sound: "red_alert",
          },
        });

        console.log(`📨 FCM sent to topic: ${topicName}`);

        // ⚡ Centrifugo broadcast per department
        await publishToCentrifugo(topicName, {
          type: "new_complaint",
          title: "New Complaint Registered",
          message: body,
          patientName: populatedComplaint.patientName,
          bedNo: populatedComplaint.bedNo,
          consultantDoctorName:
            populatedComplaint?.consultantDoctorName?.name || "N/A",
          department: label,
          createdAt: populatedComplaint.createdAt,
        });

        console.log(`📡 Centrifugo event pushed to channel: ${topicName}`);
      }
    }
  } catch (err) {
    console.error("❌ Notification send failed:", err.message);
  }

  // 9️⃣ Save one log entry in DB — readable names in `body`
  try {
    // 🟢 Convert backend keys into readable department labels for UI and emails
    const readableDepartments =
      payload?.loginType === "admin"
        ? "All Departments"
        : involvedDepartments.length > 0
          ? involvedDepartments
            .map((deptKey) => DEPT_LABEL[deptKey] || formatDeptLabel(deptKey))
            .join(", ")
          : "N/A";

    // 🟢 Prepare human-friendly body text for email / notification
    const bodyText = `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a complaint for ${readableDepartments}.`;

    // ✅ Save notification  (clean department labels)
    await Notification()?.create({
      title: "Complaint Registered",
      body: bodyText,
      data: {
        complaint: populatedComplaint.complaintId?.toString() || "N/A",
        complaintId: populatedComplaint._id?.toString(),
        patientName: populatedComplaint.patientName || null,
        contact: populatedComplaint.contact,
        bedNo: populatedComplaint.bedNo,
        consultantDoctorName:
          populatedComplaint?.consultantDoctorName?.name || "N/A",
        departments: readableDepartments, // ✅ clean display here too
      },
      department:
        payload?.loginType === "admin" ? "All Departments" : readableDepartments,
      status: "sent",
    });


    console.log("Complaint notification saved in DB with human-friendly names");
  } catch (err) {
    console.error("Failed to save complaint notification:", err.message);
  }

  return populatedComplaint;
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
