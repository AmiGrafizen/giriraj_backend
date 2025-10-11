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

export default router;
