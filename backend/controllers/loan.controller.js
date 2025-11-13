// controllers/loan.controller.js
import mongoose from "mongoose";
import Loan from "../models/loan.model.js";
import Book from "../models/book.model.js";
import Member from "../models/member.model.js";
import Staff from "../models/staff.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a  loan
export const createLoan = async (req, res) => {
  try {
    const { book_id, notes, member_id: bodyMemberId } = req.body;
    const user = req.user;
    const userType = req.userType;

    if (!book_id || !isObjectId(book_id)) {
      return res.status(400).json({ success: false, message: "Valid book_id is required" });
    }

    let member_id;
    if (userType === "member") {
      
      member_id = String(user._id);
    } else if (userType === "staff") {
     
      if (!bodyMemberId || !isObjectId(bodyMemberId)) {
        return res.status(400).json({ success: false, message: "member_id is required when staff creates a reservation" });
      }
      member_id = bodyMemberId;
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

   
    const [book, member] = await Promise.all([
      Book.findById(book_id),
      Member.findById(member_id),
    ]);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    
    const existing = await Loan.findOne({
      book_id,
      member_id,
      $or: [
        { status: { $in: [["reserved"], ["borrowed"], ["overdue"]] } }, 
        { approved: true },
        { pending: true, status: { $in: ["reserved"] } }
      ]
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "You already have an active reservation/loan for this book" });
    }

    
    const loan = await Loan.create({
      book_id,
      member_id,
      notes: typeof notes === "string" ? notes.trim() : undefined,
      status: ["reserved"],
      approved: false,
      pending: true,
      
    });

    const populated = await Loan.findById(loan._id)
      .populate("book_id", "title author genre")
      .populate("member_id", "name email");

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createReservation error:", err);
    return res.status(500).json({ success: false, message: err.message });
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

    // Mark overdue loans dynamically
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

// Approve loan
export const approveLoan = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const loanId = req.params.id;
    const staffId = String(req.user._id);

    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({ success: false, message: "Invalid loan id" });
    }

    let updatedLoan;

    await session.withTransaction(async () => {
     
      const loan = await Loan.findById(loanId).session(session);
      if (!loan) throw Object.assign(new Error("Reservation not found"), { status: 404 });

      if (loan.approved) throw Object.assign(new Error("Reservation already approved"), { status: 400 });
      if (!loan.status || !loan.status.includes("reserved")) {
        throw Object.assign(new Error("Loan is not a pending reservation"), { status: 400 });
      }

      
      const book = await Book.findById(loan.book_id).session(session);
      if (!book) throw Object.assign(new Error("Book not found"), { status: 404 });
      if (book.available <= 0) throw Object.assign(new Error("Book not available"), { status: 400 });

     
      const now = new Date();
      loan.borrow_date = now;
      loan.due_date = addDays(now, 30);
      loan.approved = true;
      loan.pending = false;
      loan.status = ["borrowed"];
      loan.staff_id = staffId;

      await loan.save({ session });

      
      book.available -= 1;
      if (book.available < 0) book.available = 0;
      await book.save({ session });

     
      updatedLoan = await Loan.findById(loan._id)
        .populate("book_id", "title author genre")
        .populate("member_id", "name email")
        .populate("staff_id", "full_name email")
        .session(session);
    });

    return res.status(200).json({ success: true, data: updatedLoan });
  } catch (err) {
    console.error("approveReservation error:", err);
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || "Server error" });
  } finally {
    session.endSession();
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

