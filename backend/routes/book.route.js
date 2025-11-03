

import { Router } from "express";
import {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";

const router = Router();

router.route("/").get(listBooks).post(createBook); 

router
  .route("/:id")
  .get(getBookById) 
  .patch(updateBook) 
  .delete(deleteBook); 

export default router;
