// backend/routes/auth.staff.route.js

import express from "express";
import {
  createStaff,
  loginStaff,
  changeStaffPassword,
  adminResetStaffPassword,
} from "../controllers/auth.staff.controller.js";
import {
  protect,
  adminOnly,
  staffOnly,
} from "../middleware/auth.middleware.js";
import { logoutUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Login for staff/admin
router.post("/login", loginStaff);
router.post("/logout", logoutUser);

// Only admin can create staff
router.post("/create", /*protect, adminOnly,*/ createStaff);

// Staff (or admin) changes own password
router.post("/change-password", protect, staffOnly, changeStaffPassword);

// Admin resets a staff password
router.post(
  "/staff/:id/reset-password",
  protect,
  adminOnly,
  adminResetStaffPassword
);

export default router;
