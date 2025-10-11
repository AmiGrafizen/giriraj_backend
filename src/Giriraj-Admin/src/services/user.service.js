
import { girirajModels } from '../db/giriraj.db.js';
import { sendNotification } from '../utils/sendNotification.js';
import { sendWhatsAppMessage } from '../utils/sendWhatsAppMessage.js';


const createComplaint = async (data) => {
  return await girirajModels.GIRIRajComplaints?.create(data);
};

// const createIPDPatient = async (payload) => {
//   const patient = await girirajModels.GIRIRAJIPDPatients?.create(payload);

//   if (!patient) {
//     console.error("❌ Failed to create IPD patient");
//     return null;
//   }

//   const populatedPatient = await girirajModels.GIRIRAJIPDPatients?.findById(
//     patient._id
//   )
//     .populate("consultantDoctorName", "name qualification")
//     .lean();

//   console.log("✅ IPD patient created:", populatedPatient.patientName);

//   let fcmErrors = [];

//   try {
//     const users = await girirajModels.GIRIRAJUser?.find({})
//       .select("fcmTokens email name")
//       .lean();

//     const tokens = users.flatMap((u) => u.fcmTokens || []).filter(Boolean);

//     if (!tokens.length) {
//       console.warn("⚠️ No FCM tokens found. Skipping notification.");
//     } else {
//       console.log(`📨 Sending FCM notification to ${tokens.length} user(s)...`);

//       const notificationData = {
//         patientId: String(populatedPatient._id),
//         patientName: String(populatedPatient.patientName || ""),
//         bedNo: String(populatedPatient.bedNo || ""),
//         consultantDoctorName:
//           String(populatedPatient?.consultantDoctorName?.name || "N/A"),
//         screen: "PatientDetails", // 👈 tells app which screen to open
//       };

//       const chunkSize = 500;
//       for (let i = 0; i < tokens.length; i += chunkSize) {
//         const chunk = tokens.slice(i, i + chunkSize);

//         const response = await sendNotification({
//           tokens: chunk,
//           title: "🩺 New IPD Patient Added",
//           body: `Patient ${populatedPatient.patientName} (Bed No ${populatedPatient.bedNo}) has been added.`,
//           data: notificationData, // 👈 include screen info
//         });

//         if (response?.responses) {
//           const invalidTokens = [];

//           response.responses.forEach((r, idx) => {
//             if (!r.success) {
//               const errorMsg = `❌ Token ${chunk[idx]}: ${r.error?.message}`;
//               console.error(errorMsg);

//               fcmErrors.push(errorMsg);

//               if (
//                 r.error?.code === "messaging/invalid-argument" ||
//                 r.error?.code ===
//                   "messaging/registration-token-not-registered"
//               ) {
//                 invalidTokens.push(chunk[idx]);
//               }
//             }
//           });

//           if (invalidTokens.length > 0) {
//             console.log("🧹 Cleaning invalid tokens:", invalidTokens);
//             await girirajModels.GIRIRAJUser.updateMany(
//               { fcmTokens: { $in: invalidTokens } },
//               { $pull: { fcmTokens: { $in: invalidTokens } } }
//             );
//           }
//         }
//       }
//     }
//   } catch (err) {
//     console.error("🔥 FCM notification failed:", err);
//     fcmErrors.push(`🔥 FCM notification failed: ${err.message}`);
//   }

//   if (populatedPatient.contact) {
//     try {
//       const errorMessage =
//         fcmErrors.length > 0
//           ? `⚠️ Some FCM errors:\n${fcmErrors.join("\n")}`
//           : "✅ No FCM errors";

//       await sendWhatsAppMessage({
//         phoneNumber: populatedPatient.contact,
//         patientName: populatedPatient.patientName,
//         extra: errorMessage,
//       });
//     } catch (err) {
//       console.error(
//         "❌ WhatsApp message failed:",
//         err.response?.data || err.message
//       );
//     }
//   } else {
//     console.warn("⚠️ Patient has no contact number. WhatsApp skipped.");
//   }

//   return populatedPatient;
// };

const createIPDPatient = async (payload, io) => {
  // 1. Create the patient
  const patient = await girirajModels.GIRIRAJIPDPatients?.create(payload);

  if (!patient) {
    throw new Error("❌ Failed to create IPD patient");
  }

  // 2. Populate doctor info
  const populatedPatient = await girirajModels.GIRIRAJIPDPatients?.findById(
    patient._id
  )
    .populate("consultantDoctorName", "name qualification")
    .lean();

  // 3. WhatsApp
  if (populatedPatient.contact) {
    try {
      await sendWhatsAppMessage({
        phoneNumber: populatedPatient.contact,
        patientName: populatedPatient.patientName,
      });
    } catch (err) {
      console.error("❌ WhatsApp send failed:", err.message);
    }
  }

  // 4. Socket.IO
  if (io) {
    const socketData = {
      patientName: populatedPatient.patientName,
      bedNo: populatedPatient.bedNo,
      consultantDoctorName:
        populatedPatient?.consultantDoctorName?.name || "N/A",
      createdAt: populatedPatient.createdAt,
    };

    io.emit("ipd:new", socketData);
  }

  //   await sendNotification({
  //   title: "New IPD Feedback",
  //   body: `Patient ${populatedPatient.patientName} (Bed ${populatedPatient.bedNo}) admitted under ${
  //     populatedPatient?.consultantDoctorName?.name || "N/A"
  //   }.`,
  //   topic: "hospital-notifications", // or use token for specific user
  //   data: {
  //     patientId: populatedPatient._id.toString(),
  //     bedNo: String(populatedPatient.bedNo),
  //   },
  // });


  // 5. Save notification in DB
  await girirajModels.GIRIRAJNotification?.create({
    title: "IPD",
    body: `Patient ${populatedPatient.patientName} (Bed ${populatedPatient.bedNo}) has been admitted.`,
    data: {
      patientName: populatedPatient.patientName,
      contact: populatedPatient.contact,
      bedNo: populatedPatient.bedNo,
      consultantDoctorName:
        populatedPatient?.consultantDoctorName?.name || "N/A",
    },
    department: "IPD",
    status: "sent",
  });

  return populatedPatient;
};


// const createIPDConcern = async (payload, io) => {
//   // 1️⃣ Create complaint
//   const complaint = await girirajModels.GIRIRAJIPDConcern?.create(payload);
//   if (!complaint) {
//     console.error("❌ Failed to create Complaint");
//     return null;
//   }

//   // 2️⃣ Populate doctor info
//   const populatedComplaint = await girirajModels.GIRIRAJIPDConcern?.findById(
//     complaint._id
//   )
//     .populate("consultantDoctorName", "name qualification")
//     .lean();

//   console.log("✅ IPD complaint created:", populatedComplaint.patientName);

//   // 3️⃣ Optional WhatsApp
//   if (populatedComplaint.contact) {
//     try {
//       await sendWhatsAppMessage({
//         phoneNumber: populatedComplaint.contact,
//         patientName: populatedComplaint.patientName,
//       });
//       console.log("✅ WhatsApp message sent to patient");
//     } catch (err) {
//       console.error("❌ WhatsApp failed:", err.response?.data || err.message);
//     }
//   }

//   // 4️⃣ Socket.IO real-time broadcast
//   try {
//     if (io) {
//       io.emit("ipd:complaint", {
//         patientName: populatedComplaint.patientName,
//         bedNo: populatedComplaint.bedNo,
//         consultantDoctorName:
//           populatedComplaint?.consultantDoctorName?.name || "N/A",
//         contact: populatedComplaint.contact || null,
//         createdAt: populatedComplaint.createdAt,
//       });
//       console.log("📢 Complaint broadcasted via Socket.IO");
//     }
//   } catch (err) {
//     console.error("❌ Socket.IO emit failed:", err.message);
//   }

//   // 5️⃣ FCM Notifications → One per department (still separate)
//   const DEPT_KEYS = [
//     "doctorServices",
//     "billingServices",
//     "housekeeping",
//     "maintenance",
//     "diagnosticServices",
//     "dietitianServices",
//     "security",
//     "nursing",
//   ];

//   const MODULE_MAP = {
//     doctorServices: "doctor_service",
//     billingServices: "billing_service",
//     housekeeping: "housekeeping_service",
//     maintenance: "maintenance_service",
//     diagnosticServices: "diagnostic_service",
//     dietitianServices: "dietitian_service",
//     security: "security_service",
//     nursing: "nursing_service",
//   };

//   const DEPT_LABEL = {
//     doctorServices: "Doctor",
//     billingServices: "Billing",
//     housekeeping: "Housekeeping",
//     maintenance: "Maintenance",
//     diagnosticServices: "Diagnostic",
//     dietitianServices: "Dietitian",
//     security: "Security",
//     nursing: "Nursing",
//   };

//   let involvedDepartments = [];

//   try {
//     involvedDepartments = DEPT_KEYS.filter((key) => {
//       const block = populatedComplaint[key];
//       if (!block) return false;
//       const hasText = block.text && String(block.text).trim().length > 0;
//       const hasAttachments =
//         Array.isArray(block.attachments) && block.attachments.length > 0;
//       return hasText || hasAttachments;
//     });

//     if (involvedDepartments.length === 0) {
//       console.warn("⚠️ No departments found. FCM notifications skipped.");
//     } else {
//       for (const deptKey of involvedDepartments) {
//         const module = MODULE_MAP[deptKey] || "ipd_service";
//         const topicName = `hospital-${module}`;

//         await sendNotification({
//           title: "New Complaint Added",
//           body: `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a complaint in ${DEPT_LABEL[deptKey]}.`,
//           topic: topicName,
//           data: {
//             complaintId: populatedComplaint._id.toString(),
//             bedNo: String(populatedComplaint.bedNo),
//             patientName: populatedComplaint.patientName || "",
//             consultantDoctorName:
//               populatedComplaint?.consultantDoctorName?.name || "N/A",
//             department: DEPT_LABEL[deptKey],
//             module,
//           },
//         });

//         console.log(`📨 FCM sent to ${topicName}`);
//       }
//     }
//   } catch (err) {
//     console.error("❌ Firebase notification failed:", err.message);
//   }

//   // 6️⃣ Save ONE Notification in DB (for display)
//   try {
//     const departmentList = involvedDepartments
//       .map((key) => DEPT_LABEL[key])
//       .join(", ");

//     await girirajModels.GIRIRAJNotification.create({
//       title: "Complaint Registered",
//       body: `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a complaint for ${departmentList}.`,
//       data: {
//         complaintId: populatedComplaint._id.toString(),
//         patientName: populatedComplaint.patientName || null,
//         contact: populatedComplaint.contact,
//         bedNo: populatedComplaint.bedNo,
//         consultantDoctorName:
//           populatedComplaint?.consultantDoctorName?.name || "N/A",
//         departments: departmentList,
//       },
//       department: "Multiple", // indicate multi-department complaint
//       status: "sent",
//     });

//     console.log("✅ Single complaint notification saved in DB");
//   } catch (err) {
//     console.error("❌ Failed to save complaint notification:", err.message);
//   }

//   return populatedComplaint;
// };


const createIPDConcern = async (payload, io) => {
  // 1️⃣ Create complaint
  const complaint = await girirajModels.GIRIRAJIPDConcern?.create(payload);
  if (!complaint) {
    console.error("❌ Failed to create Complaint");
    return null;
  }

  // 2️⃣ Populate doctor info
  const populatedComplaint = await girirajModels.GIRIRAJIPDConcern?.findById(
    complaint._id
  )
    .populate("consultantDoctorName", "name qualification")
    .lean();

  console.log("✅ IPD complaint created:", populatedComplaint.patientName);

  // 3️⃣ Optional WhatsApp Message
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

  // 4️⃣ Socket.IO real-time broadcast
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

  // 5️⃣ FCM Notifications
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

  let involvedDepartments = [];

  try {
    // ✅ If loginType is admin → notify ALL departments
    if (payload?.loginType === "admin") {
      involvedDepartments = [...DEPT_KEYS];
      console.log("🟢 Admin detected — sending notifications to ALL departments");
    } else {
      // Otherwise, notify only filled departments
      involvedDepartments = DEPT_KEYS.filter((key) => {
        const block = populatedComplaint[key];
        if (!block) return false;
        const hasText = block.text && String(block.text).trim().length > 0;
        const hasAttachments =
          Array.isArray(block.attachments) && block.attachments.length > 0;
        return hasText || hasAttachments;
      });
    }

    if (involvedDepartments.length === 0) {
      console.warn("⚠️ No departments found. FCM notifications skipped.");
    } else {
      for (const deptKey of involvedDepartments) {
        const module = MODULE_MAP[deptKey] || "ipd_service";
        const topicName = `hospital-${module}`;

        await sendNotification({
          title: "New Complaint Added",
          body: `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a complaint in ${DEPT_LABEL[deptKey]}.`,
          topic: topicName,
          data: {
            complaintId: populatedComplaint._id.toString(),
            bedNo: String(populatedComplaint.bedNo),
            patientName: populatedComplaint.patientName || "",
            consultantDoctorName:
              populatedComplaint?.consultantDoctorName?.name || "N/A",
            department: DEPT_LABEL[deptKey],
            module,
          },
        });

        console.log(`📨 FCM sent to ${topicName}`);
      }
    }
  } catch (err) {
    console.error("❌ Firebase notification failed:", err.message);
  }

  // 6️⃣ Save ONE notification in DB (for notification screen)
  try {
    const departmentList =
      payload?.loginType === "admin"
        ? "All Departments"
        : involvedDepartments.map((key) => DEPT_LABEL[key]).join(", ");

    await girirajModels.GIRIRAJNotification.create({
      title: "Complaint Registered",
      body: `Patient ${populatedComplaint.patientName} (Bed ${populatedComplaint.bedNo}) raised a complaint for ${departmentList}.`,
      data: {
        complaintId: populatedComplaint._id.toString(),
        patientName: populatedComplaint.patientName || null,
        contact: populatedComplaint.contact,
        bedNo: populatedComplaint.bedNo,
        consultantDoctorName:
          populatedComplaint?.consultantDoctorName?.name || "N/A",
        departments: departmentList,
      },
      department:
        payload?.loginType === "admin" ? "All Departments" : "Multiple",
      status: "sent",
    });

    console.log("✅ Complaint notification saved in DB");
  } catch (err) {
    console.error("❌ Failed to save complaint notification:", err.message);
  }

  return populatedComplaint;
};
  



const createOPDPatient = async (payload, io) => {
  // 1️⃣ Create OPD patient
  const patient = await girirajModels.GIRIRAJOpd?.create(payload);

  if (!patient) {
    console.error("❌ Failed to create OPD patient");
    return null;
  }

  // 2️⃣ Populate doctor info safely
  const populatedPatient = await girirajModels.GIRIRAJOpd?.findById(patient._id)
    .populate("consultantDoctorName", "name qualification")
    .lean();

  console.log("✅ OPD patient created:", populatedPatient.patientName);

  /**
   * ------------------------------------------
   * 💬 WhatsApp (to patient)
   * ------------------------------------------
   */
  if (populatedPatient.contact) {
    try {
      await sendWhatsAppMessage({
        phoneNumber: populatedPatient.contact,
        patientName: populatedPatient.patientName,
      });
      console.log("✅ WhatsApp message sent to OPD patient");
    } catch (err) {
      console.error(
        "❌ WhatsApp message failed:",
        err.response?.data || err.message
      );
    }
  } else {
    console.warn("⚠️ OPD patient has no contact number. WhatsApp skipped.");
  }

  /**
   * ------------------------------------------
   * 🔔 Socket.IO (for real-time dashboard)
   * ------------------------------------------
   */
  try {
    if (io) {
      io.emit("opd:new", {
        patientName: populatedPatient.patientName,
        consultantDoctorName:
          populatedPatient?.consultantDoctorName?.name || "N/A",
        contact: populatedPatient.contact || "N/A",
        createdAt: populatedPatient.createdAt,
      });
      console.log("📢 OPD notification emitted via socket.io");
    }
  } catch (err) {
    console.error("❌ Socket.IO emit failed:", err.message);
  }

  /**
   * ------------------------------------------
   * 🔥 Firebase Push Notification
   * ------------------------------------------
   */
  // try {
  //   await sendNotification({
  //     title: "New OPD Feedback",
  //     body: `Patient ${populatedPatient.patientName} has been added under Dr. ${
  //       populatedPatient?.consultantDoctorName?.name || "N/A"
  //     }.`,
  //     topic: "hospital-notifications", // 👈 topic to which your app must subscribe
  //     data: {
  //       patientId: populatedPatient._id.toString(),
  //       patientName: populatedPatient.patientName,
  //       contact: populatedPatient.contact || "",
  //       consultantDoctorName:
  //         populatedPatient?.consultantDoctorName?.name || "N/A",
  //     },
  //   });

  //   console.log("📨 Firebase OPD notification sent successfully");
  // } catch (err) {
  //   console.error("❌ Firebase OPD notification failed:", err.message);
  // }

  /**
   * ------------------------------------------
   * 🗂️ Save notification in DB
   * ------------------------------------------
   */
  try {
    await girirajModels.GIRIRAJNotification.create({
      title: "OPD",
      body: `Patient ${populatedPatient.patientName} has been added.`,
      data: {
        patientName: populatedPatient.patientName,
        contact: populatedPatient.contact,
        consultantDoctorName:
          populatedPatient?.consultantDoctorName?.name || "N/A",
      },
      department: "OPD",
      status: "sent",
    });
    console.log("✅ OPD notification saved in DB");
  } catch (err) {
    console.error("❌ Failed to save OPD notification:", err.message);
  }

  return populatedPatient;
};




const createOPDConcern = async (payload) => {
  return await girirajModels.GIRIRAJOPDConcern?.create(payload);
};


const getUserByEmail = async (email) => {
  return girirajModels?.GIRIRAJUser.findOne({ email });
};

const getDoctors = async () => {
  return await girirajModels.GIRIRAJDoctor?.find().sort({ createdAt: -1 });
}

export default {
  createComplaint, createIPDPatient, createOPDPatient, createIPDConcern, createOPDConcern, getUserByEmail, getDoctors,
};