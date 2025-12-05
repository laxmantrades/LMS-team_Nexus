// routes/staff.routes.js
import { Router } from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";
import { adminOnly, protect, staffAndAdminOnly } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/", adminOnly,getStaff);
router.post("/",protect,adminOnly, createStaff);


router.get("/:id", getStaffById);
router.patch("/update",protect,staffAndAdminOnly, updateStaff);
router.delete("/:id",adminOnly, deleteStaff);

export default router;