import express from "express";
import {
  registerMember,
  loginMember,
  changeMemberPassword,
} from "../controllers/auth.member.controller.js";
import { memberOnly, protect } from "../middleware/auth.middleware.js";
import { logoutUser } from "../controllers/auth.controller.js";

const router = express.Router();
//register member
router.post("/", registerMember);
//login member
router.post("/login", loginMember);
//logout user
router.post("/logout", logoutUser);

router.patch("/:id/password", protect, memberOnly, changeMemberPassword);
export default router;
