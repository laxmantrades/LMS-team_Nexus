import { Router } from "express";
import {
  createpayment,
  getMyPayments,
  listmyPayments,
} from "../controllers/payment.controller.js";
import { protect, staffOnly } from "../middleware/auth.middleware.js";
// payment routes
const router = Router();

router.post("/",protect,staffOnly, createpayment);
router.get("/mypayments", listmyPayments);
router.get("/mine", protect, getMyPayments);
export default router;
