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

const router = express.Router();


router.post("/login", loginStaff);
router.post("/create", createStaff); /*protect, adminOnly,*/
router.post("/change-password", protect, staffOnly, changeStaffPassword);
router.post(
  "/:id/reset-password",
  protect,
  adminOnly,
  adminResetStaffPassword
);

export default router;
