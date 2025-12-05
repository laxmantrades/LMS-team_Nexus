// routes/loan.route.js
import { Router } from "express";
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  approveLoan,
  getMyLoans,
  getMyLoanForBook,
  rejectLoan,
} from "../controllers/loan.controller.js";
import {
  adminOnly,
  
  protect,
  staffAndAdminOnly,

} from "../middleware/auth.middleware.js";

const router = Router();


router.get("/", protect,staffAndAdminOnly, getLoans); 


router.get("/mine", protect, getMyLoans); 
router.get("/my", protect, getMyLoanForBook);


router.post("/create", protect, createLoan); 


router.post("/:id/approve", protect, staffAndAdminOnly, approveLoan);


router.get("/:id", protect,staffAndAdminOnly, getLoanById);
router.patch("/:id", protect,staffAndAdminOnly, updateLoan);
router.delete("/:id", protect,staffAndAdminOnly, deleteLoan);
router.post("/:id/reject", protect,staffAndAdminOnly, rejectLoan);

export default router;
