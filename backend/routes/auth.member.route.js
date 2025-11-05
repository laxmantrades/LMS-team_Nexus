import express from "express";
import {
  registerMember,
  loginMember,
  changeMemberPassword,
} from "../controllers/auth.member.controller.js";

const router = express.Router();


router.post("/register", registerMember);


router.post("/login", loginMember);

// @route   PATCH /api/members/:id/password
// @desc    Change member password
router.patch("/:id/password", changeMemberPassword);

export default router;
