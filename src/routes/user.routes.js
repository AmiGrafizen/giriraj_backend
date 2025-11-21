import { Router } from 'express';
import userController from '../controllers/user.controller.js';


const router = Router();

router.post('/ipd-patient', userController.createIPDPatient);

router.post('/ipd-concern', userController.createIPDConcern);

router.post('/internal-complaint', userController.createInternalComplaint);

router.post('/complaint', userController.createComplaint);

router.post('/opd-patient', userController.createOPDPatient);

router.post('/opd-concern', userController.createOPDConcern);

router.post('/employee-feedback', userController.createEmployeeFeedback);

router.post('/consultant-feedback', userController.createConsultantFeedback);

router.get('/doctors', userController.getDoctors);

export default router;
