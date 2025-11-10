
import Book from "../models/book.model.js";

/** Create */
export const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const listBooks = async (req, res, next) => {
  try {
    const { q, author, genre, minAvailable, maxAvailable, sort = "-createdAt" } = req.query;

    const filter = {};

    // Search by text
    if (q) filter.$text = { $search: q };

    // Filter by author
    if (author) filter.author = author;

    // Filter by genre
    if (genre) filter.genre = genre;

    // Filter by available count
    if (minAvailable || maxAvailable) {
      filter.available = {};
      if (minAvailable) filter.available.$gte = Number(minAvailable);
      if (maxAvailable) filter.available.$lte = Number(maxAvailable);
    }

    // Fetch all matching books without pagination
    const items = await Book.find(filter).sort(sort);

    res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};


export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};


export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};


export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book deleted" });
  } catch (err) {
    next(err);
  }
};
