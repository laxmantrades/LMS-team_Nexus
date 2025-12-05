import { Router } from "express";
import {
  

  sweepFines,
 

  deleteFine,

  getMyFines,
  getFinesByEmail,
  getUnpaidFines,
  getFines,
} from "../controllers/fine.controller.js";
import { protect, staffAndAdminOnly } from "../middleware/auth.middleware.js";

const router = Router();


router.post("/sweep", sweepFines);


router.get("/search-by-email", protect,staffAndAdminOnly, getFinesByEmail);
router.get("/unpaid", protect, getUnpaidFines);


router.get("/", protect,staffAndAdminOnly,getFines);
router.get("/myfines",protect, getMyFines);




router.delete("/:id", deleteFine);

export default router;