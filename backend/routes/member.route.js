// routes/members.routes.js
import { Router } from "express";
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/member.controller.js";

const router = Router();

// /api/members
router.get("/", getMembers);
router.post("/", createMember);

// /api/members/:id
router.get("/:id", getMemberById);


router.patch("/:id", updateMember);
router.delete("/:id", deleteMember);

export default router;