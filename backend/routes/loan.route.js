// routes/loan.route.js
import { Router } from "express";
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} from "../controllers/loan.controller.js";

const router = Router();

// /api/loans
router.get("/", getLoans);
router.post("/", createLoan);

// /api/loans/:id
router.get("/:id", getLoanById);
router.patch("/:id", updateLoan);
router.delete("/:id", deleteLoan);

export default router;