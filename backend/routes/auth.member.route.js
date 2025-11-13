import express from "express";
import {
  registerMember,
  loginMember,
  changeMemberPassword,
} from "../controllers/auth.member.controller.js";
import { memberOnly, protect } from "../middleware/auth.middleware.js";
import { logoutUser } from "../controllers/auth.controller.js";

const router = express.Router();


router.post("/", registerMember);


router.post("/login", loginMember);
router.post("/logout", logoutUser);


router.patch("/:id/password",protect,memberOnly, changeMemberPassword);
export default router;
