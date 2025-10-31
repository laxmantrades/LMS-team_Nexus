// routes/staff.routes.js
import { Router } from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";

const router = Router();

// /api/staff
router.get("/", getStaff);
router.post("/", createStaff);

// /api/staff/:id
router.get("/:id", getStaffById);
router.patch("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;