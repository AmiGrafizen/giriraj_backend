import express from "express";
import { usePrimaryDB, useBackupDB } from "../db/index.js";

const router = express.Router();

router.post("/switch-db", (req, res) => {
  const { target } = req.body;

  if (target === "primary") {
    usePrimaryDB();
  } else if (target === "backup") {
    useBackupDB();
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid target — must be 'primary' or 'backup'",
    });
  }

  res.json({
    success: true,
    message: `🔄 Switched to ${target.toUpperCase()} database`,
  });
});

export default router;
