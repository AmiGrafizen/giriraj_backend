import userService from "../services/user.service.js";
import httpStatus from 'http-status';
import catchAsync from "../utils/catchAsync.js";

const createIPDPatient = catchAsync(async (req, res) => {
  console.log("📥 Incoming patient data:", req.body);

  const io = req.app.get("io");

  const patient = await userService.createIPDPatient(req.body, io);

  return res.status(httpStatus.CREATED).json({
    status: true,
    message: "Patient created successfully",
    data: patient,
  });
});

 const createIPDConcern = catchAsync(async (req, res) => {
    const io = req.app.get("io");
  const reminder = await userService.createIPDConcern(req.body, io);
  res.status(httpStatus.CREATED).json({
    status: true,
    message: 'Concern created successfully',
    data: reminder,
  });
});

 const createInternalComplaint = catchAsync(async (req, res) => {
    const io = req.app.get("io");
  const reminder = await userService.createInternalComplaint(req.body, io);
  res.status(httpStatus.CREATED).json({
    status: true,
    message: 'Complaint created successfully',
    data: reminder,
  });
});

 const createOPDPatient = catchAsync(async (req, res) => {
    const io = req.app.get("io");
  const reminder = await userService.createOPDPatient(req.body, io);
  res.status(httpStatus.CREATED).json({
    status: true,
    message: 'Patient created successfully',
    data: reminder,
  });
});

 const createOPDConcern = catchAsync(async (req, res) => {
  const reminder = await userService.createOPDConcern(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    message: 'Reminder created successfully',
    data: reminder,
  });
});

 const createComplaint = catchAsync(async (req, res) => {
  const reminder = await userService.createComplaint(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    message: 'Reminder created successfully',
    data: reminder,
  });
});

 const getDoctors = catchAsync(async (req, res) => {
  const patients = await userService.getDoctors(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

const createEmployeeFeedback = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  // 🧹 Clean invalid rating values (remove 0 or undefined)
  if (req.body?.ratings) {
    req.body.ratings = Object.fromEntries(
      Object.entries(req.body.ratings).filter(([_, v]) => v >= 1 && v <= 5)
    );
  }

  // ✅ Proceed to create feedback
  const feedback = await userService.createEmployeeFeedback(req.body, io);
  console.log("✅ Employee feedback saved:", feedback._id);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Employee feedback submitted successfully",
    data: feedback,
  });
});

const createConsultantFeedback = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  // 🧹 Clean invalid rating values (remove 0 or undefined)
  if (req.body?.ratings) {
    req.body.ratings = Object.fromEntries(
      Object.entries(req.body.ratings).filter(([_, v]) => v >= 1 && v <= 5)
    );
  }

  // ✅ Proceed to create feedback
  const feedback = await userService.createConsultantFeedback(req.body, io);
  console.log("✅ Consultant feedback saved:", feedback._id);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Consultant feedback submitted successfully",
    data: feedback,
  });
});

export default { createIPDPatient, createComplaint, createOPDPatient, createIPDConcern, createOPDConcern, getDoctors, createInternalComplaint,
  createEmployeeFeedback, createConsultantFeedback, 
}