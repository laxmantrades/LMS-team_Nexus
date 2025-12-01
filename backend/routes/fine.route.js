import { Router } from "express";
import {
  

  sweepFines,
  recalcFineForLoan,

  deleteFine,

  getMyFines,
  getFinesByEmail,
  getUnpaidFines,
} from "../controllers/fine.controller.js";
import { protect, staffOnly } from "../middleware/auth.middleware.js";

const router = Router();

// ---------------------------
//  PROTECTED MEMBER ROUTES
// ---------------------------
router.post("/sweep", sweepFines);


router.get("/search-by-email", protect,staffOnly, getFinesByEmail);
router.get("/unpaid", protect, getUnpaidFines);

// ---------------------------
// 🔍 PUBLIC / ADMIN ROUTES
// ---------------------------

// List and view fines
//router.get("/", getFines);
router.get("/myfines",protect, getMyFines);



// Delete (admin only, optional)
router.delete("/:id", deleteFine);

export default router;