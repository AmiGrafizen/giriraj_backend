import express from "express";
import webUserController from "../controllers/webUser.controller.js";

const router = express.Router();

router.post("/register", webUserController.registerUser);

router.post("/login", webUserController.loginUser);

router.post("/create-profile", webUserController.saveHospitalProfile);

router.get("/get-profile/:userId", webUserController.getHospitalProfile);

router.post("/dashboard/save-titles", webUserController.saveDashboardTitles);
router.get("/dashboard/get-titles", webUserController.getDashboardTitles);

router.post("/ipd/save-settings", webUserController.saveWebUserSettings);

router.get("/ipd/get-settings/:userId", webUserController.getWebUserSettings);

router.post("/opd/setup/save", webUserController.saveOPDSettingsController);

router.get("/opd/setup/get/:userId", webUserController.getOPDSettingsController);

export default router;
        