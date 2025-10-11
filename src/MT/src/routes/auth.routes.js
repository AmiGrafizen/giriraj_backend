import { Router } from 'express';
import authController from '../controllers/auth.controller.js';


const router = Router();


router.post('/user/register',authController.registerUser); 
router.post('/user/login',authController.loginUser); 
router.put('/user/:userId',authController.updateUser)
router.get('/user/refer-price/:userId', authController.getReferPrice);
router.put('/user/refer-price/:userId', authController.getReferPrice);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/set-password", authController.setPassword);

// admin 
router.post('/admin/register', authController.registerAdmin); 
router.post('/admin/login', authController.loginAdmin); 
router.get('/all-users', authController.getAllUsers);


export default router;