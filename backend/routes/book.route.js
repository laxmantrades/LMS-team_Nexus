import { Router } from "express";
import {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";
import { adminOnly, protect, staffOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(listBooks).post(protect,staffOnly,createBook);

router.route("/:id").get(getBookById).patch(protect,staffOnly,updateBook).delete(protect,staffOnly,deleteBook);

export default router;
