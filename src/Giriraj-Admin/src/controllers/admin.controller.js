import adminService from "../services/admin.service.js";
import httpStatus from 'http-status';
import catchAsync from "../utils/catchAsync.js";
import { ApiError } from "../../../utils/ApiError.js";
import tokenService from "../services/token.service.js";


const createIPDPatient = catchAsync (async (req, res) => {
    const patient = await adminService.createIPDPatient(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      message: 'Patient registered successfully',
      data: patient
    });
});


 const getIPDPatients = catchAsync(async (req, res) => {
  const patients = await adminService.getIPDPatients(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getIPDPatientById = catchAsync(async (req, res) => {
  console.log('req.params.id', req.params.id)
  const patient = await adminService.getIPDPatientById(req.params.id);
  console.log('patient', patient)
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateIPDPatientById = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateIPDPatientById(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deleteIPDPatientById = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteIPDPatientById(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});


const createOPDPatient = catchAsync (async (req, res) => {
    const patient = await adminService.createOPDPatient(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      message: 'Patient registered successfully',
      data: patient
    });
});


 const getOPDPatients = catchAsync(async (req, res) => {
  const patients = await adminService.getOPDPatients(req.body);
  console.log('patients', patients)
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getOPDPatientById = catchAsync(async (req, res) => {
  const patient = await adminService.getOPDPatientById(req.params.id);
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateOPDPatientById = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateOPDPatientById(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deleteOPDPatientById = catchAsync(async (req, res) => {
  const deleted = await adminService.delete0PDPatientById(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});


const createComplaint = catchAsync (async (req, res) => {
    const patient = await adminService.createComplaint(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      message: 'Patient registered successfully',
      data: patient
    });
});


 const getAllComplaints = catchAsync(async (req, res) => {
  const patients = await adminService.getAllComplaints(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getComplaintById = catchAsync(async (req, res) => {
  const patient = await adminService.getComplaintById(req.params.id);
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateComplaint = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateComplaint(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});


 const getComplaintStatsByDepartment = catchAsync(async (req, res) => {
  const patients = await adminService.getComplaintStatsByDepartment(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

 const getIPDPatientByRating = catchAsync(async (req, res) => {
  const patients = await adminService.getIPDPatientByRating(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

 const getOPDPatientByRating = catchAsync(async (req, res) => {
  const patients = await adminService.getOPDPatientByRating(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const createRole = catchAsync(async (req, res) => {
  const role = await adminService.createRole(req.body);
  res.status(httpStatus.CREATED).send({ role });
});

const getAllRoles = catchAsync(async (req, res) => {
  const role = await adminService.getAllRoles(req.body);
  res.status(httpStatus.OK).send({ role });
});
const getRoleById = catchAsync(async (req, res) => {
  const role = await adminService.getRoleById(req.params.id);
  res.status(httpStatus.OK).send({ role });
});

const updateRole = catchAsync(async (req, res) => {
  const role = await adminService.updateRole(req.params.id, req.body);
  res.status(httpStatus.OK).send({ role });
});

const deleteRole = catchAsync(async (req, res) => {
  const role = await adminService.deleteRole(req.params.id);
  res.status(httpStatus.OK).send({ role });
});

const createRoleUser = catchAsync(async (req, res) => {
  const roleUser = await adminService.createRoleUser(req.body);
  res.status(httpStatus.CREATED).send({ roleUser });
});

const getAllRoleUsers = catchAsync(async (req, res) => {
  const roleUser = await adminService.getAllRoleUsers(req.body);
  res.status(httpStatus.OK).send({ roleUser });
});
const getRoleUserById = catchAsync(async (req, res) => {
  const roleUser = await adminService.getRoleUserById(req.params.id);
  res.status(httpStatus.OK).send({ roleUser });
});

const updateRoleUser = catchAsync(async (req, res) => {
  const roleUser = await adminService.updateRoleUser(req.params.id, req.body);
  res.status(httpStatus.OK).send({ roleUser });
});

const deleteRoleUser = catchAsync(async (req, res) => {
  const roleUser = await adminService.deleteRoleUser(req.params.id);
  res.status(httpStatus.OK).send({ roleUser });
});

const getDashboard = catchAsync(async (req, res) => {
  const { from, to, loginType, modules } = req.query || {};
  const range = {};
  if (from) range.from = new Date(from);
  if (to) range.to = new Date(to);

  const allowedModules = modules ? modules.split(",") : [];

  const data = await adminService.getDashboard({
    from: range.from,
    to: range.to,
    modules: allowedModules,
    loginType, // 👈 pass loginType
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});


const createIPDConcern = catchAsync (async (req, res) => {
    const patient = await adminService.createIPDConcern(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      message: 'Patient registered successfully',
      data: patient
    });
});


 const getIPDConcern = catchAsync(async (req, res) => {
  const patients = await adminService.getIPDConcern(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getIPDPaConcernById = catchAsync(async (req, res) => {
  const patient = await adminService.getIPDPaConcernById(req.params.id);
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateIPDConcernById = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateIPDConcernById(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deleteIPDConcernById = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteIPDConcernById(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});

const forwardConcern = async (req, res) => {
  try {
    const { department, topic, text, attachments, mode, note } = req.body;
    const concernId = req.params.id;
    const userId = req.user?._id; // ✅ capture the user who forwards

    const updatedConcern = await adminService.forwardConcernToDepartment(
      concernId,
      department,
      {
        topic,
        text,
        attachments,
        mode,
        note, // ✅ include note for forward history
      },
      userId // ✅ pass userId into service
    );

    res.json({
      message: `Concern forwarded to ${department}`,
      concern: updatedConcern,
    });
  } catch (error) {
    console.error("Error forwarding concern:", error);
    res.status(400).json({ error: error.message });
  }
};

const fetchConcernsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const concerns = await adminService.getConcernsByDepartment(department);
    res.json(concerns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const escalateComplaint = async (req, res) => {
  try {
    const concernId = req.params.id;
    const { level, note } = req.body;
    const userId = req.user?._id; // assume user is from auth middleware

    const updatedConcern = await adminService.escalateConcern(concernId, { level, note, userId });

    res.json({
      message: `Complaint escalated to ${level}`,
      concern: updatedConcern,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const concernId = req.params.id;
    const { note, proof } = req.body;
    const userId = req.user?._id; // from auth middleware

    if (!note) {
      return res.status(400).json({ error: "Resolution note is required" });
    }

    const updatedConcern = await adminService.resolveConcern(concernId, { note, proof, userId });

    res.json({
      message: "Complaint resolved successfully",
      concern: updatedConcern,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const viewConcernHistory = async (req, res) => {
  try {
    const concernId = req.params.id;
    const history = await adminService.getConcernHistory(concernId);

    res.json({
      concernId,
      history,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /admin/update-progress/:id
const updateProgressRemark = async (req, res) => {
  try {
    const concernId = req.params.id;           // ✅ take from URL param
    const { updateNote } = req.body;
    const userId = req.user?._id;              // ✅ authenticated user

    if (!updateNote) {
      return res.status(400).json({ error: "Progress remark is required" });
    }

    const updatedConcern = await adminService.updateProgressRemarkService(
      concernId,
      updateNote,
      userId
    );

    if (!updatedConcern) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Progress updated successfully",
      data: updatedConcern,
    });
  } catch (error) {
    console.error("Error updating progress remark:", error);
    res.status(500).json({ message: "Error updating progress remark", error: error.message });
  }
};

const createDoctor = catchAsync (async (req, res) => {
    const patient = await adminService.createDoctor(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      message: 'Patient registered successfully',
      data: patient
    });
});


 const getDoctors = catchAsync(async (req, res) => {
  const patients = await adminService.getDoctors(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getDoctorById = catchAsync(async (req, res) => {
  const patient = await adminService.getDoctorById(req.params.id);
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateDoctor = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateDoctor(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deleteDoctor = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteDoctor(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});

const saveTokenController = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ success: false, message: "Missing userId or token" });
    }

    const user = await tokenService.saveUserToken(userId, token);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Token saved successfully", user });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

 const getUserNotifications = catchAsync(async (req, res) => {
  const notification = await adminService.getAllNotificationsService(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'notification fetched successfully',
    notifications: notification,
  });
});

async function getAllComplaintDetails(req, res) {
  try {
    const results = await adminService.getAllComplaintDetails();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const createBed = catchAsync (async (req, res) => {
    const bed = await adminService.createBed(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      message: 'Bed registered successfully',
      data: bed
    });
});


 const getBeds = catchAsync(async (req, res) => {
  const beds = await adminService.getBeds(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Beds fetched successfully',
    data: beds,
  });
});

const getBedById = catchAsync(async (req, res) => {
  const bed = await adminService.getBedById(req.params.id);
  if (!bed) throw new ApiError(httpStatus.NOT_FOUND, 'Bed not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Bed fetched successfully',
    data: bed,
  });
});

const updatedBed = catchAsync(async (req, res) => {
  const updatedBed = await adminService.updatedBed(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Bed updated successfully',
    data: updatedBed,
  });
});

const deleteBed = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteBed(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Bed not found');
  res.status(httpStatus.NO_CONTENT).send();
});

const validateBed = async (req, res) => {
  try {
    const bedNo = parseInt(req.params.bedNo, 10);
    const result = await adminService.validateBedNumber(bedNo);

    if (!result.valid) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error validating bed:", err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
};

const getComplaintsSummary = async (req, res) => {
try {
    const floorSummary = await adminService.getComplaintSummary();
    res.json({ success: true, floorSummary });
  } catch (err) {
    console.error("Error in complaintSummary:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

 async function getServiceSummaryController(req, res) {
  try {
    const summary = await adminService.getServiceWiseSummary();
    res.json({ success: true, summary });
  } catch (err) {
    console.error("Error in service summary:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

async function getFrequentRatings(req, res) {
  try {
    const result = await adminService.getFrequentRatingKeywords(6);
    res.json({ keywords: result });
  } catch (err) {
    console.error("Error fetching frequent ratings", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

  const frequentOPDRatings = async (req, res) => {
    try {
      const keywords = await adminService.getFrequentOPDRatings();
      res.json({ keywords });
    } catch (err) {
      console.error("Error fetching frequent OPD ratings:", err);
      res.status(500).json({ message: "Failed to fetch frequent ratings" });
    }
  };

export default { createIPDPatient, getIPDPatients, getIPDPatientById, updateIPDPatientById, deleteIPDPatientById, createComplaint, getComplaintById, getAllComplaints, updateComplaint,
  createOPDPatient, getOPDPatients, getOPDPatientById, updateOPDPatientById, deleteOPDPatientById, getComplaintStatsByDepartment, getIPDPatientByRating, getOPDPatientByRating, updateProgressRemark,
  createRole, getAllRoles, getRoleById, updateRole, deleteRole, createRoleUser, getAllRoleUsers, getRoleUserById, updateRoleUser, deleteRoleUser, getDashboard, createIPDConcern,
  getIPDConcern, getIPDPaConcernById, updateIPDConcernById, deleteIPDConcernById,forwardConcern, fetchConcernsByDepartment, escalateComplaint, resolveComplaint, viewConcernHistory,
  createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, saveTokenController, getUserNotifications, getAllComplaintDetails, getAllComplaintDetails, 
  createBed, getBeds, getBedById, updatedBed, deleteBed, validateBed, getComplaintsSummary, getServiceSummaryController, getFrequentRatings, frequentOPDRatings,
}