// routes/staff.routes.js
import { Router } from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";
import { adminOnly, protect, staffOnly } from "../middleware/auth.middleware.js";

const router = Router();

// /api/staff
router.get("/", getStaff);
router.post("/",protect,adminOnly, createStaff);

// /api/staff/:id
router.get("/:id", getStaffById);
router.patch("/update",protect,staffOnly, updateStaff);
router.delete("/:id",adminOnly, deleteStaff);

export default router;