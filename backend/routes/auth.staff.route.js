// backend/routes/auth.staff.route.js

import express from "express";
import {
  
  loginStaff,
  changeStaffPassword,
  
} from "../controllers/auth.staff.controller.js";
import {
  protect,
  staffAndAdminOnly,
  

} from "../middleware/auth.middleware.js";
import { logoutUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Login for staff/admin
router.post("/login", loginStaff);
router.post("/logout", logoutUser);



router.post("/change-password", protect,staffAndAdminOnly, changeStaffPassword);


export default router;
