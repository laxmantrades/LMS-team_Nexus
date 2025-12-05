import { Router } from "express";
import {
  createpayment,
  getAllPayments,
  getMyPayments,
  listmyPayments,
} from "../controllers/payment.controller.js";
import { protect, staffAndAdminOnly } from "../middleware/auth.middleware.js";
// payment routes
const router = Router();

router.post("/",protect,staffAndAdminOnly, createpayment);
router.get("/mypayments",protect, listmyPayments);
router.get("/mine", protect, getMyPayments);
router.get("/",protect,staffAndAdminOnly, getAllPayments);

export default router;
