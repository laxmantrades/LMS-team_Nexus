// routes/loan.route.js
import { Router } from "express";
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  approveLoan,
} from "../controllers/loan.controller.js";
import { protect, staffOnly } from "../middleware/auth.middleware.js";

const router = Router();

/* /api/loans */
router.get("/", getLoans);
//router.post("/", createLoan);

/*  /api/loans/:id */
router.get("/:id", getLoanById);
router.patch("/:id", updateLoan);
router.delete("/:id", deleteLoan);
router.post("/create", protect, createLoan);
router.post("/:id/approve",protect, staffOnly, approveLoan);


//TODO
//router.post("/:id/reject", protect, staffOnly, rejectLoan);


export default router;
