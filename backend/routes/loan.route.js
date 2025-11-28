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
  memberOnly,
  protect,
  staffOnly,
} from "../middleware/auth.middleware.js";

const router = Router();

/* Public: list all loans (admin/staff usually) */
router.get("/", protect,staffOnly, getLoans); // consider protecting this in prod

/* Member routes - explicit and placed BEFORE the param route */
router.get("/mine", protect, getMyLoans); // GET /api/loans/mine  -> list all of current member's loans
router.get("/my", protect, getMyLoanForBook); // GET /api/loans/my?book_id=... -> single loan for book (keeps your current frontend)

// Create and member actions
router.post("/create", protect, createLoan); // POST /api/loans/create

/* Staff actions (literal routes first) */
router.post("/:id/approve", protect, staffOnly, approveLoan);

/* Param route: loan by id (placed AFTER specific literal routes) */
router.get("/:id", protect, getLoanById);
router.patch("/:id", protect,staffOnly, updateLoan);
router.delete("/:id", protect,adminOnly, deleteLoan);
router.post("/:id/reject", protect, staffOnly, rejectLoan);

export default router;
