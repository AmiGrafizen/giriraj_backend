import adminService from "../services/admin.service.js";
import httpStatus from 'http-status';
import catchAsync from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";
import tokenService from "../services/token.service.js";
import { girirajModels } from "../db/index.js";


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
  const deleted = await adminService.deleteOPDPatientById(req.params.id);
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

export const partialResolveController = async (req, res) => {
  try {
    const { id } = req.params; // complaintId
    const { department, note, proof, userId } = req.body;

    // 🔒 Validation
    if (!department || !note) {
      return res.status(400).json({
        success: false,
        message: "Department and note are required.",
      });
    }

    // 🧩 Call the service
    const result = await adminService.partialResolveConcern(id, {
      department,
      note,
      proof,
      userId,
    });

    // ✅ Clean and unified response
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Partial resolve failed:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while partially resolving the complaint.",
    });
  }
};


const getPartialResolveDetailsController = async (req, res) => {
  try {
    const { concernId } = req.params;
    const data = await adminService.getPartialResolveDetails(concernId);

    return res.status(200).json({
      success: true,
      message: "Partial resolve details fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Partial Resolve Details Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load partial resolve details.",
    });
  }
};

const partialInProgressController = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, note, userId } = req.body;

    const result = await adminService.partialInProgressConcern(id, { department, note, userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("Partial InProgress Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const partialEscalateController = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, note, level, userId } = req.body;

    const result = await adminService.partialEscalateConcern(id, { department, note, level, userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("Partial Escalate Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNote = catchAsync(async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    if (!userId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "userId is required",
      });
    }

    // ✅ Auto-detect model type based on ID existence
    let userModel = "GIRIRAJUser";
    const isRoleUser = await girirajModels.GIRIRAJRoleUser.findById(userId);
    if (isRoleUser) userModel = "GIRIRAJRoleUser";

    const noteData = {
      title: title?.trim() || "",
      content: content?.trim() || "",
      userId,
      userModel,
    };

    console.log("🧩 Auto-detected model:", userModel);
    console.log("📥 noteData received:", noteData);

    const note = await adminService.createNote(noteData);
    if (!note) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Note creation failed",
      });
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("❌ Error in createNote:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error creating note",
      error: error.message,
    });
  }
});



 const getAllNotes = catchAsync(async (req, res) => {
  const patients = await adminService.getAllNotes(req.body);
  console.log('patients', patients)
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getNoteById = catchAsync(async (req, res) => {
  const patient = await adminService.getNoteById(req.params.id);
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateNote = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await girirajModels.GIRIRAJNote.findByIdAndUpdate(
      id,
      { $set: updateData }, // ✅ only update provided fields
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Note updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error updating note",
      error: error.message,
    });
  }
});


const deleteNote = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteNote(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});

 const getNotesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await adminService.getNotesByUserId(userId);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message,
    });
  }
};

const createTask = catchAsync(async (req, res) => {
  const task = await adminService.createTask(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});

// 🟣 Get All Tasks (admin only)
const getAllTask = catchAsync(async (req, res) => {
  const tasks = await adminService.getAllTask();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tasks fetched successfully",
    data: tasks,
  });
});

// 🔹 Get Task by ID
const getTaskById = catchAsync(async (req, res) => {
  const task = await adminService.getTaskById(req.params.id);
  if (!task) throw new ApiError(httpStatus.NOT_FOUND, "Task not found");

  res.status(httpStatus.OK).json({
    success: true,
    message: "Task fetched successfully",
    data: task,
  });
});

// 🔹 Get All Tasks by UserId (new route)
const getTasksByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const tasks = await adminService.getTasksByUserId(userId);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Tasks fetched successfully by user",
    data: tasks,
  });
});

// 🔸 Update Task
const updateTask = catchAsync(async (req, res) => {
  const updatedTask = await adminService.updateTask(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Task updated successfully",
    data: updatedTask,
  });
});

// 🔴 Delete Task
const deleteTask = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteTask(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, "Task not found");

  res.status(httpStatus.OK).json({
    success: true,
    message: "Task deleted successfully",
  });
});

 const getInternalComplaint = catchAsync(async (req, res) => {
  const patients = await adminService.getInternalComplaint(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getInternalComplaintById = catchAsync(async (req, res) => {
  const patient = await adminService.getInternalComplaintById(req.params.id);
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateInternalComplaint = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateInternalComplaint(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});


 const deleteInternalComplaint = catchAsync(async (req, res) => {
  const patients = await adminService.deleteInternalComplaint(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Complaint Delete successfully',
    data: patients,
  });
});

const forwardInternalComplaint = async (req, res) => {
  try {
    const { department, topic, text, attachments, mode, note } = req.body;
    const concernId = req.params.id;
    const userId = req.user?._id; // ✅ capture the user who forwards

    const updatedConcern = await adminService.forwardInternalComplaint(
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

const escalateInternalComplaint = async (req, res) => {
  try {
    const concernId = req.params.id;
    const { level, note } = req.body;
    const userId = req.user?._id; // assume user is from auth middleware

    const updatedConcern = await adminService.escalateInternalComplaint(concernId, { level, note, userId });

    res.json({
      message: `Complaint escalated to ${level}`,
      concern: updatedConcern,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resolveInternalComplaint = async (req, res) => {
  try {
    const concernId = req.params.id;
    const { note, proof } = req.body;
    const userId = req.user?._id; // from auth middleware

    if (!note) {
      return res.status(400).json({ error: "Resolution note is required" });
    }

    const updatedConcern = await adminService.resolveInternalComplaint(concernId, { note, proof, userId });

    res.json({
      message: "Complaint resolved successfully",
      concern: updatedConcern,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInternalComplaintHistory = async (req, res) => {
  try {
    const concernId = req.params.id;
    const history = await adminService.getInternalComplaintHistory(concernId);

    res.json({
      concernId,
      history,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /admin/update-progress/:id
const updateInternalProgress = async (req, res) => {
  try {
    const concernId = req.params.id;           // ✅ take from URL param
    const { updateNote } = req.body;
    const userId = req.user?._id;              // ✅ authenticated user

    if (!updateNote) {
      return res.status(400).json({ error: "Progress remark is required" });
    }

    const updatedConcern = await adminService.updateInternalProgress(
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

export const partialResolveInternal = async (req, res) => {
  try {
    const { id } = req.params; // complaintId
    const { department, note, proof, userId } = req.body;

    // 🔒 Validation
    if (!department || !note) {
      return res.status(400).json({
        success: false,
        message: "Department and note are required.",
      });
    }

    // 🧩 Call the service
    const result = await adminService.partialResolveInternal(id, {
      department,
      note,
      proof,
      userId,
    });

    // ✅ Clean and unified response
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Partial resolve failed:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while partially resolving the complaint.",
    });
  }
};


const getPartialResolveInternalDetails = async (req, res) => {
  try {
    const { concernId } = req.params;
    const data = await adminService.getPartialResolveInternalDetails(concernId);

    return res.status(200).json({
      success: true,
      message: "Partial resolve details fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Partial Resolve Details Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load partial resolve details.",
    });
  }
};

const partialInProgressInternal = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, note, userId } = req.body;

    const result = await adminService.partialInProgressInternal(id, { department, note, userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("Partial InProgress Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const partialEscalateInternal = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, note, level, userId } = req.body;

    const result = await adminService.partialEscalateInternal(id, { department, note, level, userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("Partial Escalate Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminForwardConcern = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { toDepartment, note, isPartial, affectedDepartments } = req.body;

    const concern = await adminService.updateAdminAction(
      id,
      "forward",
      { toDepartment, note, isPartial, affectedDepartments },
      adminId
    );

    res.status(200).json({
      message: `Concern ${isPartial ? "partially" : "fully"} forwarded successfully`,
      concern,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🟧 Admin: Escalate Concern (full or partial)
 */
const adminEscalateConcern = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { level, note, isPartial, affectedDepartments } = req.body;

    const concern = await adminService.updateAdminAction(
      id,
      "escalate",
      { level, note, isPartial, affectedDepartments },
      adminId
    );

    res.status(200).json({
      message: `Concern ${isPartial ? "partially" : "fully"} escalated successfully`,
      concern,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🟩 Admin: Resolve Concern (full or partial)
 */
const adminResolveConcern = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id;
    const { note, proof, isPartial = false, department, affectedDepartments } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Concern ID is required" });
    }
    if (!note) {
      return res.status(400).json({ message: "Resolution note is required" });
    }

    // 🧩 Prepare payload for service
    const data = {
      note,
      proof: proof || [],
      isPartial,
      department, // department for partial admin resolve
      affectedDepartments: affectedDepartments || (department ? [department] : []),
    };

    // ✅ Call service
    const result = await adminService.updateAdminAction(id, "resolved_by_admin", data, adminId);

    return res.status(200).json({
      success: true,
      message: `Concern ${isPartial ? "partially" : "fully"} resolved by admin successfully`,
      data: result.concern,
    });
  } catch (err) {
    console.error("Admin Resolve Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to resolve concern by admin",
    });
  }
};

/**
 * 🟨 Admin: Mark In Progress (full or partial)
 */
const adminProgressConcern = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { note, isPartial, affectedDepartments } = req.body;

    const concern = await adminService.updateAdminAction(
      id,
      "progress",
      { note, isPartial, affectedDepartments },
      adminId
    );

    res.status(200).json({
      message: `Concern marked ${isPartial ? "partially" : "fully"} in progress`,
      concern,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


 const handleAdminPartialResolve = async (req, res) => {
  try {
    const response = await adminService.partialAdminResolveConcern(req.params.id, {
      department: req.body.department,
      note: req.body.note,
      proof: req.body.proof,
      userId: req.user?._id,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Partial Resolve Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   🟨 Partial In-Progress Concern
====================================================== */
export const handleAdminPartialInProgress = async (req, res) => {
  try {
    const response = await adminService.partialAdminInProgressConcern(req.params.id, {
      department: req.body.department,
      note: req.body.note,
      userId: req.user?._id,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Partial In-Progress Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   🟥 Partial Escalate Concern
====================================================== */
export const handleAdminPartialEscalate = async (req, res) => {
  try {
    const response = await adminService.partialAdminEscalateConcern(req.params.id, {
      department: req.body.department,
      note: req.body.note,
      level: req.body.level,
      userId: req.user?._id,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Partial Escalate Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   🧾 Get Partial Resolve Details
====================================================== */
  export const getAdminPartialResolveInfo = async (req, res) => {
    try {
      const data = await adminService.getAdminPartialResolveDetails(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Partial resolution details fetched successfully",
        data,
      });
    } catch (error) {
      console.error("Get Partial Resolve Details Error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const createTaskList = catchAsync(async (req, res) => {
  const task = await adminService.createTaskList(req.body);
  console.log('task', task)
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});

// 🟣 Get All Tasks (admin only)
const getAllTaskList = catchAsync(async (req, res) => {
  const tasks = await adminService.getAllTaskList();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tasks fetched successfully",
    data: tasks,
  });
});

const getTaskListByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const tasks = await adminService.getTaskListByUserId(userId);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Tasks fetched successfully by user",
    data: tasks,
  });
});

const getTaskByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { userId, userModel } = req.query;

    const data = await adminService.getTasksByList(listId, userId, userModel);

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully for the selected list",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Task By List Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tasks for this list",
    });
  }
};

const getAllTaskListsWithTasks = async (req, res) => {
  try {
    const { userId, userModel } = req.query;
    console.log("🧩 Backend Query Params:", { userId, userModel });

    const data = await adminService.getAllTaskListsWithTasks(userId, userModel);

    return res.status(200).json({
      success: true,
      message: "All task lists with tasks fetched successfully",
      totalLists: data.length,
      data,
    });
  } catch (error) {
    console.error("❌ GetAllTaskListsWithTasks Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch task lists with tasks",
    });
  }
};

const handleSearchComplaints = async (req, res) => {
  try {
    const { query } = req.query;


    // ✅ Allow even one character search
    if (typeof query !== "string" || query.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No query provided",
      });
    }

    console.log("🔍 Incoming Query:", query);

    const results = await adminService.searchComplaints(query.trim());
    console.log("✅ Results Found:", results.length);

    return res.status(200).json({
      success: true,
      total: results.length,
      data: results,
      message:
        results.length > 0
          ? "Complaints fetched successfully"
          : "No complaints found",
    });
  } catch (error) {
    console.error("Complaint Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching complaints",
      error: error.message,
      data: [],
    });
  }
};

const createBugReport = async (req, res) => {
  try {
    let screenshotUrl = "";

    // ✅ Handle file upload
    if (req.file) {
      screenshotUrl = await uploadToHPanel(req.file, "bug-reports");
    }

    const { description, userId, userModel, priority } = req.body;

    if (!description || !userId || !userModel) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: description, userId, or userModel",
      });
    }

    const newBug = await adminService.createBugReportService({
      userId,
      userModel,
      screenshot: screenshotUrl,
      description,
      priority,
    });

    // ✅ Optional: notify admin panel
    // await girirajModels.GIRIRAJNotification?.create({
    //   title: "New Bug Report",
    //   body: `${description.substring(0, 60)}...`,
    //   department: "Development",
    //   status: "saved",
    //   data: {
    //     bugId: newBug._id.toString(),
    //     reporterType: userModel,
    //   },
    // });

    res.status(201).json({
      success: true,
      message: "Bug report submitted successfully",
      data: newBug,
    });
  } catch (error) {
    console.error("❌ Bug report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit bug report",
    });
  }
};

const getAllBugReports = async (req, res) => {
  try {
    const bugs = await adminService.getAllBugReportsService();
    res.json({ success: true, data: bugs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bug reports",
    });
  }
};

const updateBugStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await adminService.updateBugStatusService(id, status);
    res.json({
      success: true,
      message: "Bug report status updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bug status",
    });
  }
};

 const getNotificationSettings = async (req, res) => {
  try {
    const { userId, userModel } = req.query;

    if (!userId || !userModel) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or userModel in request query",
      });
    }

    const settings = await adminService.getNotificationSettingsService(userId, userModel);

    return res.status(200).json({
      success: true,
      message: "Notification settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    console.error("❌ getNotificationSettings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification settings",
      error: error.message,
    });
  }
};

/* ----------------------------------------------------
   🔹 Controller: Update Notification Settings
---------------------------------------------------- */
const updateNotificationSettings = async (req, res) => {
  try {
    const { userId, userModel } = req.body;

    if (!userId || !userModel) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or userModel in request body",
      });
    }

    const updatedSettings = await adminService.updateNotificationSettingsService(
      userId,
      userModel,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("❌ updateNotificationSettings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
      error: error.message,
    });
  }
};

const getEmployeeFeedback = catchAsync(async (req, res) => {
  const patients = await adminService.getEmployeeFeedback(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getEmployeeFeedbackById = catchAsync(async (req, res) => {
  console.log('req.params.id', req.params.id)
  const patient = await adminService.getEmployeeFeedbackById(req.params.id);
  console.log('patient', patient)
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateEmployeeFeedback = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateEmployeeFeedback(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deleteEmployeeFeedback = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteEmployeeFeedback(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});

 const getEmployeeFeedbackByRating = catchAsync(async (req, res) => {
  const patients = await adminService.getEmployeeFeedbackByRating(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

  const frequentEmployeeFeedbackRatings = async (req, res) => {
    try {
      const keywords = await adminService.getFrequentEmployeeRatings();
      res.json({ keywords });
    } catch (err) {
      console.error("Error fetching frequent OPD ratings:", err);
      res.status(500).json({ message: "Failed to fetch frequent ratings" });
    }
  };

  const getConsultantFeedback = catchAsync(async (req, res) => {
  const patients = await adminService.getConsultantFeedback(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const getConsultantFeedbackById = catchAsync(async (req, res) => {
  console.log('req.params.id', req.params.id)
  const patient = await adminService.getConsultantFeedbackById(req.params.id);
  console.log('patient', patient)
  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient fetched successfully',
    data: patient,
  });
});

const updateConsultantFeedback = catchAsync(async (req, res) => {
  const updatedPatient = await adminService.updateConsultantFeedback(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deleteConsultantFeedback = catchAsync(async (req, res) => {
  const deleted = await adminService.deleteConsultantFeedback(req.params.id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  res.status(httpStatus.NO_CONTENT).send();
});

 const getConsultantFeedbackByRating = catchAsync(async (req, res) => {
  const patients = await adminService.getConsultantFeedbackByRating(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

  const frequentConsultantFeedbackRatings = async (req, res) => {
    try {
      const keywords = await adminService.getConsultantFeedbackByRating();
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
  createBed, getBeds, getBedById, updatedBed, deleteBed, validateBed, getComplaintsSummary, getServiceSummaryController, getFrequentRatings, frequentOPDRatings, partialResolveController,
  getPartialResolveDetailsController, partialEscalateController, partialInProgressController, createNote, getAllNotes, getNoteById, updateNote, deleteNote,
  createTask, getAllTask, getTaskById, updateTask, deleteTask, getNotesByUserId, getTasksByUserId, getInternalComplaint, getInternalComplaintById, updateInternalComplaint,
  deleteInternalComplaint, forwardInternalComplaint, updateInternalProgress, escalateInternalComplaint, resolveInternalComplaint, partialEscalateInternal, getInternalComplaintHistory,
  partialResolveInternal, getPartialResolveInternalDetails, partialInProgressInternal, adminResolveConcern, adminEscalateConcern, adminProgressConcern, adminForwardConcern, handleAdminPartialEscalate,
  handleAdminPartialInProgress, handleAdminPartialResolve, getAdminPartialResolveInfo, createTaskList, getAllTaskList, getTaskListByUserId, getTaskByList,getAllTaskListsWithTasks,
  handleSearchComplaints, createBugReport, getAllBugReports, updateBugStatus, getNotificationSettings, updateNotificationSettings, getEmployeeFeedback, getEmployeeFeedbackById, getEmployeeFeedbackByRating,
  updateEmployeeFeedback, deleteEmployeeFeedback, getConsultantFeedback, getConsultantFeedbackByRating, frequentEmployeeFeedbackRatings, frequentConsultantFeedbackRatings, updateConsultantFeedback,
  deleteConsultantFeedback, getConsultantFeedbackById,
}