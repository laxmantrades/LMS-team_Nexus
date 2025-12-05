import { Router } from "express";
import {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";
import {  protect, staffAndAdminOnly, } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(protect,listBooks).post(protect,staffAndAdminOnly,createBook);

router.route("/:id").get(protect,getBookById).patch(protect,staffAndAdminOnly,updateBook).delete(protect,staffAndAdminOnly,deleteBook);

export default router;
