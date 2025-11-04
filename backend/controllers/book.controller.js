
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
    const {
      q,
      author,
      genre,
      bookimage,
      minAvailable,
      maxAvailable,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber  = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip        = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (q) filter.$text = { $search: q };
    if (author) filter.author = author;
    if (genre) filter.genre = genre;
    if (minAvailable || maxAvailable) {
      filter.available = {};
      if (minAvailable) filter.available.$gte = Number(minAvailable);
      if (maxAvailable) filter.available.$lte = Number(maxAvailable);
    }

    const [items, total] = await Promise.all([
      Book.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber) || 1,
        limit: limitNumber,
      },
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
