// controllers/loan.controller.js
import mongoose from "mongoose";
import Loan from "../models/loan.model.js";
import Book from "../models/book.model.js";
import Member from "../models/member.model.js";
import Staff from "../models/staff.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new loan
export const createLoan = async (req, res) => {
  try {
    const { book_id, member_id, staff_id, due_date, notes } = req.body;

    if (!book_id || !member_id || !due_date) {
      return res.status(400).json({
        success: false,
        message: "book_id, member_id, and due_date are required",
      });
    }

    if (!isObjectId(book_id) || !isObjectId(member_id)) {
      return res.status(400).json({ success: false, message: "Invalid book/member ID" });
    }

    const book = await Book.findById(book_id);
    const member = await Member.findById(member_id);
    if (!book || !member) {
      return res.status(404).json({ success: false, message: "Book or Member not found" });
    }

    if (book.available <= 0) {
      return res.status(400).json({ success: false, message: "Book not available" });
    }

    if (staff_id && !isObjectId(staff_id)) {
      return res.status(400).json({ success: false, message: "Invalid staff ID" });
    }

    const loan = await Loan.create({
      book_id,
      member_id,
      staff_id,
      due_date,
      notes,
      status: ["borrowed"],
    });

    book.available -= 1;
    await book.save();

    const populated = await Loan.findById(loan._id)
      .populate("book_id", "title author genre")
      .populate("member_id", "name email")
      .populate("staff_id", "full_name email");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all loans (filtering and pagination)
export const getLoans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      member_id,
      
      staff_id,
      book_id,
      overdue,
    } = req.query;

    const filter = {};

    if (status) filter.status = { $in: [status] };
    if (member_id && isObjectId(member_id)) filter.member_id = member_id;
    if (staff_id && isObjectId(staff_id)) filter.staff_id = staff_id;
    if (book_id && isObjectId(book_id)) filter.book_id = book_id;

  
    if (overdue === "true") {
      filter.due_date = { $lt: new Date() };
      filter.return_date = { $exists: false };
    }

    const numericLimit = Math.min(Number(limit) || 10, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [items, total] = await Promise.all([
      Loan.find(filter)
        .populate("book_id", "title author genre")
        .populate("member_id", "name email")
        .populate("staff_id", "full_name email")
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .sort("-borrow_date"),
      Loan.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit) || 1,
        limit: numericLimit,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single loan by ID
export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const loan = await Loan.findById(id)
      .populate("book_id", "title author genre")
      .populate("member_id", "name email")
      .populate("staff_id", "full_name email");

    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update loan
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updates = { ...req.body };
    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    if (updates.return_date && !loan.return_date) {
      loan.return_date = updates.return_date || new Date();
      loan.status = ["returned"];

      const book = await Book.findById(loan.book_id);
      if (book) {
        book.available += 1;
        await book.save();
      }
    } else {
      
      if (updates.status) loan.status = updates.status;
      if (updates.notes) loan.notes = updates.notes;
      if (updates.due_date) loan.due_date = updates.due_date;
    }

    await loan.save();

    const populated = await Loan.findById(id)
      .populate("book_id", "title author genre")
      .populate("member_id", "name email")
      .populate("staff_id", "full_name email");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Delete loan
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const loan = await Loan.findByIdAndDelete(id);
    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    if (!loan.return_date) {
      const book = await Book.findById(loan.book_id);
      if (book) {
        book.available += 1;
        await book.save();
      }
    }

    res.json({ success: true, message: "Loan deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

