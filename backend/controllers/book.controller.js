
import Book from "../models/book.model.js";
import loanModel from "../models/loan.model.js";


export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      genre,
      bookImage,
      published_date,
      available,
      description
    } = req.body;

    
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required.' });
    }

    
    const existing = await Book.findOne({ title: title.trim(), author: author.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A book with the same title and author already exists.' });
    }

    const bookData = {
      title: title,
      author: author,
      genre: genre ? genre : undefined,
      bookImage: bookImage || undefined,
      published_date: published_date ? new Date(published_date) : undefined,
      available: available,
      description: description || undefined
    };

    const book = await Book.create(bookData);
    return res.status(201).json({ success: true, data: book });
  } catch (err) {
   
    console.error('createBook error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

export const listBooks = async (req, res, next) => {
  try {
    const { q, author, genre, minAvailable, maxAvailable, sort = "-createdAt" } = req.query;

    const filter = {};

   
    if (q) filter.$text = { $search: q };

    
    if (author) filter.author = author;

   
    if (genre) filter.genre = genre;

   
    if (minAvailable || maxAvailable) {
      filter.available = {};
      if (minAvailable) filter.available.$gte = Number(minAvailable);
      if (maxAvailable) filter.available.$lte = Number(maxAvailable);
    }

   
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
    const bookId = req.params.id;

    
    const activeLoan = await loanModel.findOne({
      book_id: bookId,
      status: { $in: ["borrowed", "overdue"] }, // status is an array of strings
    }).select("_id status member_id");

    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this book because it is currently borrowed or overdue.",
        loan_id: activeLoan._id,
        loan_status: activeLoan.status,
      });
    }

    
    const book = await Book.findByIdAndDelete(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    return res.json({ success: true, message: "Book deleted" });
  } catch (err) {
    next(err);
  }
};
