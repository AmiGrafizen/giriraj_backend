import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';

const router = Router();

router
  .route('/ipd-patient')
  .post(adminController.createIPDPatient)
  .get(adminController.getIPDPatients);

router
  .route('/ipd-patient/:id')
  .get(adminController.getIPDPatientById)
  .put(adminController.updateIPDPatientById)
  .delete(adminController.deleteIPDPatientById);

router
  .route('/ipd-concern')
  .post(adminController.createIPDConcern)
  .get(adminController.getIPDConcern);

router
  .route('/ipd-concern/:id')
  .get(adminController.getIPDPaConcernById)
  .put(adminController.updateIPDConcernById)
  .delete(adminController.deleteIPDConcernById);

router
  .route('/opd-patient')
  .post(adminController.createOPDPatient)
  .get(adminController.getOPDPatients);

router
  .route('/opd-patient/:id')
  .get(adminController.getOPDPatientById)
  .put(adminController.updateOPDPatientById)
  .delete(adminController.deleteOPDPatientById);

router
  .route('/complaint')
  .post(adminController.createComplaint)
  .get(adminController.getAllComplaints);

router
  .route('/complaint/:id')
  .get(adminController.getComplaintById)
  .put(adminController.updateComplaint);

router.get('/complaint-by-department', adminController.getComplaintStatsByDepartment);

router.get('/ipd-by-rating', adminController.getIPDPatientByRating);

router.get('/opd-by-rating', adminController.getOPDPatientByRating);

router.route('/role')
.post(adminController.createRole)
.get(adminController.getAllRoles);

router.route('/role/:id')
.put(adminController.updateRole)
.get(adminController.getRoleById)
.delete(adminController.deleteRole);

router.route('/role-user')
.post(adminController.createRoleUser)
.get(adminController.getAllRoleUsers);

router.route('/role-user/:id')
.put(adminController.updateRoleUser)
.get(adminController.getRoleUserById)
.delete(adminController.deleteRoleUser);


router.route('/doctor')
.post(adminController.createDoctor)
.get(adminController.getDoctors);

router.route('/doctor/:id')
.put(adminController.updateDoctor)
.get(adminController.getDoctorById)
.delete(adminController.deleteDoctor);

router.route('/bed')
.post(adminController.createBed)
.get(adminController.getBeds);

router.route('/bed/:id')
.put(adminController.updatedBed)
.get(adminController.getBedById)
.delete(adminController.deleteBed);

router.get("/validate/:bedNo", adminController.validateBed);

router.get("/dashboard", adminController.getDashboard);

router.post("/:id/forward", adminController.forwardConcern);

router.get("/department/:department", adminController.fetchConcernsByDepartment);

router.post("/:id/escalate", adminController.escalateComplaint);

router.post("/:id/resolve", adminController.resolveComplaint);

router.get("/:id/history", adminController.viewConcernHistory);

router.put("/update-progress/:id", adminController.updateProgressRemark);

router.post("/tokens/save", adminController.saveTokenController);

router.get("/notifications", adminController.getUserNotifications);

router.get("/complaint-details", adminController.getAllComplaintDetails);
router.get("/complaint-summary", adminController.getComplaintsSummary);

router.get("/service-summary", adminController.getServiceSummaryController);

router.get("/frequent-ratings", adminController.getFrequentRatings);

router.get("/opd-frequent-ratings", adminController.frequentOPDRatings);

router.post("/:id/partial-resolve", adminController.partialResolveController);

router.post("/:id/partial-inprogress", adminController.partialInProgressController);

router.post("/:id/partial-escalate", adminController.partialEscalateController);

router.get("/partial-resolve/:concernId", adminController.getPartialResolveDetailsController);

router.route('/note')
.post(adminController.createNote)
.get(adminController.getAllNotes);

router.route('/note/:id')
.put(adminController.updateNote)
.get(adminController.getNoteById)
.delete(adminController.deleteNote);

router.get('/note/user/:userId', adminController.getNotesByUserId);

router.route('/task')
.post(adminController.createTask)
.get(adminController.getAllTask);

router.route('/task/:id')
.put(adminController.updateTask)
.get(adminController.getTaskById)
.delete(adminController.deleteTask);

router.get("/task/user/:userId", adminController.getTasksByUserId);

router.get("/task/list/:listId", adminController.getTaskByList);

router.route('/task-list')
.post(adminController.createTaskList)
.get(adminController.getAllTaskList);

router.get("/task-list/user/:userId", adminController.getTaskListByUserId);

router.get("/task-list/all-with-tasks", adminController.getAllTaskListsWithTasks);


router
  .route('/internal-complaints')
  .get(adminController.getInternalComplaint);

router
  .route('/internal-complaint/:id')
  .get(adminController.getInternalComplaintById)
  .put(adminController.updateInternalComplaint)
  .delete(adminController.deleteInternalComplaint);

router.post("/internal/:id/partial-resolve", adminController.partialResolveInternal);

router.post("/internal/:id/partial-inprogress", adminController.partialInProgressInternal);

router.post("/internal/:id/partial-escalate", adminController.partialEscalateInternal);

router.get("/internal/partial-resolve/:concernId", adminController.getPartialResolveInternalDetails);

router.post("/internal/:id/forward", adminController.forwardInternalComplaint);

router.post("/internal/:id/escalate", adminController.escalateInternalComplaint);

router.post("/internal/:id/resolve", adminController.resolveInternalComplaint);

router.get("/internal/:id/history", adminController.getInternalComplaintHistory);

router.put("/internal/update-progress/:id", adminController.updateInternalProgress);

router.post("/:id/admin-forward", adminController.adminForwardConcern);

router.post("/:id/admin-progress", adminController.adminProgressConcern);

router.post("/:id/admin-escalate", adminController.adminEscalateConcern);

router.post("/:id/admin-resolve", adminController.adminResolveConcern);

router.post("/:id/admin-partial-resolve", adminController.handleAdminPartialResolve);

router.post("/:id/admin-partial-inprogress", adminController.handleAdminPartialInProgress);

router.post("/:id/admin-partial-escalate", adminController.handleAdminPartialEscalate);

router.get("/partial-resolve/:concernId", adminController.getAdminPartialResolveInfo);

router.get("/search-concern", adminController.handleSearchComplaints);

router.post("/bug/create", adminController.createBugReport);

router.get("/all-bugs", adminController.getAllBugReports);

router.put("/update-bug/:id", adminController.updateBugStatus);

router.get("/notification-settings", adminController.getNotificationSettings);

router.put("/notification-setting/update", adminController.updateNotificationSettings);

router
  .route('/employee-feedback')
  .get(adminController.getEmployeeFeedback);

router
  .route('/employee-feedback/:id')
  .get(adminController.getEmployeeFeedbackById)
  .put(adminController.updateEmployeeFeedback)
  .delete(adminController.deleteEmployeeFeedback);

router.get('/employee-by-rating', adminController.getEmployeeFeedbackByRating);

router.get("/frequent-employee-keywords", adminController.frequentEmployeeFeedbackRatings);

router
  .route('/consultant-feedback')
  .get(adminController.getConsultantFeedback);

router
  .route('/consultant-feedback/:id')
  .get(adminController.getConsultantFeedbackById)
  .put(adminController.updateConsultantFeedback)
  .delete(adminController.deleteConsultantFeedback);

router.get('/consultant-by-rating', adminController.getConsultantFeedbackByRating);

router.get("/frequent-consultant-keywords", adminController.frequentConsultantFeedbackRatings);

export default router;
