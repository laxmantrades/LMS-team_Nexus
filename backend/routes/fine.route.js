import { Router } from "express";
import {
  getFines,
  getFineById,
  sweepFines,
  recalcFineForLoan,

  deleteFine,
} from "../controllers/fine.controller.js";

const router = Router();

// ---------------------------
// 🔁 ADMIN / INTERNAL ROUTES
// ---------------------------

// Manual sweep (optional admin trigger, but cron already does this nightly)
router.post("/sweep", sweepFines);

// Manual recalc for a specific loan (if data corrected)
router.post("/recalc/:loanId", recalcFineForLoan);

// ---------------------------
// 🔍 PUBLIC / ADMIN ROUTES
// ---------------------------

// List and view fines
router.get("/", getFines);
router.get("/:id", getFineById);



// Delete (admin only, optional)
router.delete("/:id", deleteFine);

export default router;