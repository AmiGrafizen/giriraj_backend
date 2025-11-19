// ======================================================================
// CLEAN VERSION USING getModel() EVERYWHERE
// ======================================================================

import { publishToCentrifugo } from '../centrifugo/centrifugoClient.js';
import { girirajModels } from '../db/index.js';
import { sendNotification } from '../utils/sendNotification.js';
import { sendWhatsAppMessage } from '../utils/sendWhatsAppMessage.js';

// ------------------------------------------------------------------
// REUSABLE getModel()
// ------------------------------------------------------------------
function getModel(modelName) {
  if (!girirajModels || typeof girirajModels !== "object") {
    console.error("❌ girirajModels not initialized or invalid");
    return null;
  }

  const keys = Object.keys(girirajModels);
  if (!keys.length) {
    console.error("⚠️ No models loaded in girirajModels");
    return null;
  }

  const target = modelName.toLowerCase();

  const foundKey = keys.find(
    (k) => k.toLowerCase() === target || k.toLowerCase().includes(target)
  );

  if (!foundKey) {
    console.warn(`⚠️ Model "${modelName}" not found. Available:`, keys);
    return null;
  }

  let model = girirajModels[foundKey];

  if (model && typeof model.find !== "function") {
    model = model.primary || model.secondary || model.default || model.model;
  }

  if (!model || typeof model.find !== "function") {
    console.error(`❌ Invalid Mongoose model: ${foundKey}`, model);
    return null;
  }

  console.log(`✅ Using model: ${foundKey}`);
  return model;
}

const IPDPatient = () => getModel("ipdpatient");
const OPDPatient = () => getModel("opdpatient");
const IPDConcern = () => getModel("ipdconcern");
const OPDConcern = () => getModel("opdconcern");
const Notification = () => getModel("notification");
const User = () => getModel("user");
const NotificationSetting = () => getModel("notificationsetting");
const InternalComplaint = () => getModel("internalcomplaint");
const Doctor = () => getModel("doctor");
const Complaint = () => getModel("complaint");


const createComplaint = async (data) => {
  return await Complaint()?.create(data);
};

const createIPDPatient = async (payload, io) => {
  try {
    const { showInStackBar = true, userId, userModel } = payload;

    // 1️⃣ Create patient
    const patient = await IPDPatient()?.create(payload);
    if (!patient) throw new Error("Failed to create IPD patient");

    // 2️⃣ Populate doctor
    const populatedPatient = await IPDPatient()
      ?.findById(patient._id)
      .populate("consultantDoctorName", "name qualification")
      .lean();

    // 3️⃣ WhatsApp
    if (populatedPatient.contact) {
      try {
        await sendWhatsAppMessage({
          phoneNumber: populatedPatient.contact,
          patientName: populatedPatient.patientName,
        });
      } catch (err) {
        console.error("WhatsApp failed:", err.message);
      }
    }

    // 4️⃣ Notification preference
    let userSettings = null;
    if (userId && userModel) {
      userSettings = await NotificationSetting()?.findOne({ userId, userModel });
    }

    const allowSocket = showInStackBar && (userSettings?.ipd ?? true);

    // 5️⃣ Socket Emit
    if (io && allowSocket) {
      io.emit("ipd:new", {
        patientName: populatedPatient.patientName,
        bedNo: populatedPatient.bedNo,
        consultantDoctorName: populatedPatient?.consultantDoctorName?.name || "N/A",
        createdAt: populatedPatient.createdAt,
      });
    }

    // 6️⃣ Save notification
    await Notification()?.create({
      title: "IPD",
      body: `Patient ${populatedPatient.patientName} (Bed ${populatedPatient.bedNo}) added a feedback.`,
      data: {
        patientName: populatedPatient.patientName,
        bedNo: populatedPatient.bedNo,
        consultantDoctorName: populatedPatient?.consultantDoctorName?.name || "N/A",
      },
      department: "IPD",
      showInStackBar,
      status: allowSocket ? "sent" : "saved",
    });

    return populatedPatient;
  } catch (err) {
    console.error("createIPDPatient error:", err);
    throw err;
  }
};

const createIPDConcern = async (payload, io) => {
  const complaint = await IPDConcern()?.create(payload);
  if (!complaint) return null;

  const populatedComplaint = await IPDConcern()
    ?.findById(complaint._id)
    .populate("consultantDoctorName", "name qualification")
    .lean();

  // WhatsApp
  if (populatedComplaint.contact) {
    try {
      await sendWhatsAppMessage({
        phoneNumber: populatedComplaint.contact,
        patientName: populatedComplaint.patientName,
      });
    } catch {}
  }

  // Socket
  if (io) {
    io.emit("ipd:complaint", {
      patientName: populatedComplaint.patientName,
      bedNo: populatedComplaint.bedNo,
      consultantDoctorName:
        populatedComplaint?.consultantDoctorName?.name || "N/A",
      contact: populatedComplaint.contact || null,
      createdAt: populatedComplaint.createdAt,
    });
  }

  // Notification Save
  await Notification()?.create({
    title: "Complaint Registered",
    body: `Patient ${populatedComplaint.patientName} raised a complaint.`,
    data: {
      complaintId: populatedComplaint._id?.toString(),
      patientName: populatedComplaint.patientName,
      bedNo: populatedComplaint.bedNo,
    },
    department: "IPD",
    status: "sent",
  });

  return populatedComplaint;
};

const createInternalComplaint = async (payload, io) => {
  const complaint = await InternalComplaint()?.create(payload);
  if (!complaint) return null;

  const populatedComplaint = await InternalComplaint()
    ?.findById(complaint._id)
    .lean();

  if (io) {
    io.emit("internal:complaint", {
      employeeName: populatedComplaint.employeeName,
      employeeId: populatedComplaint.employeeId,
      contactNo: populatedComplaint.contactNo,
      floorNo: populatedComplaint.floorNo,
      createdAt: populatedComplaint.createdAt,
    });
  }

  return populatedComplaint;
};

const createOPDPatient = async (payload, io) => {
  try {
    const { showInStackBar = true, userId, userModel } = payload;

    const patient = await OPDPatient()?.create(payload);
    if (!patient) throw new Error("Failed to create OPD patient");

    const populatedPatient = await OPDPatient()
      ?.findById(patient._id)
      .populate("consultantDoctorName", "name qualification")
      .lean();

    if (populatedPatient.contact) {
      try {
        await sendWhatsAppMessage({
          phoneNumber: populatedPatient.contact,
          patientName: populatedPatient.patientName,
        });
      } catch {}
    }

    let userSettings = null;
    if (userId && userModel) {
      userSettings = await NotificationSetting()?.findOne({ userId, userModel });
    }

    const allowSocket = showInStackBar && (userSettings?.opd ?? true);

    if (io && allowSocket) {
      io.emit("opd:new", {
        patientName: populatedPatient.patientName,
        consultantDoctorName:
          populatedPatient?.consultantDoctorName?.name || "N/A",
        contact: populatedPatient.contact,
        createdAt: populatedPatient.createdAt,
      });
    }

    await Notification()?.create({
      title: "OPD",
      body: `Patient ${populatedPatient.patientName} has added a feedback.`,
      data: {
        patientName: populatedPatient.patientName,
        contact: populatedPatient.contact,
        consultantDoctorName:
          populatedPatient?.consultantDoctorName?.name || "N/A",
      },
      department: "OPD",
      showInStackBar,
      status: allowSocket ? "sent" : "saved",
    });

    return populatedPatient;
  } catch (err) {
    throw err;
  }
};

const createOPDConcern = async (payload) => {
  return await OPDConcern()?.create(payload);
};


const getUserByEmail = async (email) => {
  return await User()?.findOne({ email });
};


const getDoctors = async () => {
  return await Doctor()?.find().sort({ createdAt: -1 });
};

export default {createComplaint, createIPDPatient, createOPDPatient, createIPDConcern, createOPDConcern, getUserByEmail, getDoctors, createInternalComplaint,
};
