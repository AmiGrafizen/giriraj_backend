import express from "express";
import {
  // createCometUserController,
  getCometTokenController,
} from "../controllers/cometChat.controller.js";

const router = express.Router();

// Optional manual routes (safe for testing)
// router.post("/create-user", createCometUserController);
router.post("/get-token", getCometTokenController);

export default router;
