// controllers/loan.controller.js
import mongoose from "mongoose";
import Loan from "../models/loan.model.js";
import Book from "../models/book.model.js";
import Member from "../models/member.model.js";
import Staff from "../models/staff.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const addDays = (base = new Date(), days = 30) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};
const ALLOWED_STATUSES = ["reserved", "borrowed", "returned", "overdue"];
export const createLoan = async (req, res) => {
  try {
    const { book_id, notes, member_id: bodyMemberId } = req.body;
    const user = req.user;
    const userType = req.userType;

    // Validate book_id
    if (!book_id || !isObjectId(book_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid book_id is required" });
    }

    // Determine member_id (member creates for self; staff must provide member_id)
    let member_id;
    if (userType === "member") {
      member_id = String(user._id);
    } else if (userType === "staff") {
      if (!bodyMemberId || !isObjectId(bodyMemberId)) {
        return res.status(400).json({
          success: false,
          message: "member_id is required when staff creates a reservation",
        });
      }
      member_id = bodyMemberId;
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Ensure book and member exist
    const [book, member] = await Promise.all([
      Book.findById(book_id),
      Member.findById(member_id),
    ]);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    // 🔴 NEW RULE: block if member has any overdue loan (not returned yet)
    const hasOverdue = await Loan.exists({
      member_id,
      status: "overdue",          // Mongo matches array elements as well
      return_date: { $exists: false }, // still not returned
    });

    if (hasOverdue) {
      return res.status(400).json({
        success: false,
        message:
          "You have overdue book(s) and outstanding fines. Please visit the library to return the book(s) and pay the fine before making a new reservation.",
      });
    }

    // Define which statuses are considered "active"
    const ACTIVE_STATUSES = ["reserved", "borrowed", "overdue"];

    // Prevent duplicate active reservation/loan for same book & member
    const existing = await Loan.findOne({
      book_id,
      member_id,
      status: { $in: ACTIVE_STATUSES },
    });
    console.log(existing);
    

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have an active reservation/loan for this book",
        data: existing,
      });
    }

    // Enforce maximum active loans/reservations per member (3)
    const MAX_ACTIVE = 3;
    const activeCount = await Loan.countDocuments({
      member_id,
      status: { $in: ACTIVE_STATUSES },
    });

    if (activeCount >= MAX_ACTIVE) {
      return res.status(400).json({
        success: false,
        message: `Limit reached: member already has ${activeCount} active loan(s). Maximum allowed is ${MAX_ACTIVE}.`,
      });
    }

    // Create reservation (status default to reserved)
    const loan = await Loan.create({
      book_id,
      member_id,
      notes: typeof notes === "string" ? notes.trim() : undefined,
      status: ["reserved"],
      // borrow_date/due_date will be set on approval
    });

    const populated = await Loan.findById(loan._id)
      .populate("book_id", "title author genre")
      .populate("member_id", "name email");

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createLoan error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const approveLoan = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const loanId = req.params.id;
    const staffId = String(req.user._id);

    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid loan id" });
    }

    let updatedLoan;

    await session.withTransaction(async () => {
      // load reservation
      const loan = await Loan.findById(loanId).session(session);
      if (!loan)
        throw Object.assign(new Error("Reservation not found"), {
          status: 404,
        });

      if (loan.approved)
        throw Object.assign(new Error("Reservation already approved"), {
          status: 400,
        });
      if (!loan.status || !loan.status.includes("reserved")) {
        throw Object.assign(new Error("Loan is not a pending reservation"), {
          status: 400,
        });
      }

      // check availability
      const book = await Book.findById(loan.book_id).session(session);
      if (!book)
        throw Object.assign(new Error("Book not found"), { status: 404 });
      if (book.available <= 0)
        throw Object.assign(new Error("Book not available"), { status: 400 });

      // mark loan approved and set dates
      const now = new Date();
      loan.borrow_date = now;
      loan.due_date = addDays(now, 30);
      loan.approved = true;
      loan.pending = false;
      loan.status = ["borrowed"];
      loan.staff_id = staffId;

      await loan.save({ session });

      // decrement availability
      book.available -= 1;
      if (book.available < 0) book.available = 0;
      await book.save({ session });

      // reload populated
      updatedLoan = await Loan.findById(loan._id)
        .populate("book_id", "title author genre")
        .populate("member_id", "name email")
        .populate("staff_id", "full_name email")
        .session(session);
    }); // commit

    return res.status(200).json({ success: true, data: updatedLoan });
  } catch (err) {
    console.error("approveReservation error:", err);
    const status = err.status || 500;
    return res
      .status(status)
      .json({ success: false, message: err.message || "Server error" });
  } finally {
    session.endSession();
  }
};

export const getMyLoanForBook = async (req, res) => {
  try {
    const memberId = req.user?._id || req.user?.id;
    if (!memberId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { book_id } = req.query;
    if (!book_id) {
      return res.status(400).json({ message: "book_id is required" });
    }

    // Convert to ObjectId safely
    const bookObjectId = new mongoose.Types.ObjectId(book_id);
    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    const loan = await Loan.findOne({
      book_id: bookObjectId,
      member_id: memberObjectId,
      $or: [
        { return_date: null },
        { return_date: { $exists: false } }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ loan: loan || null });
  } catch (error) {
    console.error("getMyLoanForBook error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getLoans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,       // can be "reserved" or "reserved,borrowed"
      member_id,
      staff_id,
      book_id,
      overdue,
      approved,     // "true" | "false"
    } = req.query;

    const filter = {};

    // status: accept single or comma-separated list; match loans where status array contains any of these
    if (status) {
      const statuses = String(status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length > 0) {
        filter.status = { $in: statuses };
      }
    }

    // approved filter (if provided)
    if (typeof approved !== "undefined") {
      // treat "true" (string) as true, anything else as false
      filter.approved = String(approved) === "true";
    }

    if (member_id && isObjectId(member_id)) filter.member_id = member_id;
    if (staff_id && isObjectId(staff_id)) filter.staff_id = staff_id;
    if (book_id && isObjectId(book_id)) filter.book_id = book_id;

    // Mark overdue loans dynamically: due_date in past AND not yet returned
    if (overdue === "true") {
      filter.due_date = { $lt: new Date() };
      filter.$or = [
        { return_date: { $exists: false } },
        { return_date: null },
      ];
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
    console.error("getLoans error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


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
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }

    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getMyLoans = async (req, res) => {
  try {
    console.log("hi");
    
    
    const memberId = req.user && req.user._id;
    

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const loans = await Loan.find({ member_id: memberId })
      .sort({ createdAt: -1 })
      .populate("book_id", "title author genre")
      .populate("staff_id", "full_name email");

    return res.json({ success: true, data: loans });
  } catch (err) {
    console.error("getMyLoans error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};




export const updateLoan = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updates = { ...req.body };
    const user = req.user; // auth middleware should populate
    const userType = req.userType;

    // Load loan
    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found" });

    // Member authorization: members can only update their own loans (but NOT approve)
    if (userType === "member" && String(loan.member_id) !== String(user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Validate incoming status if provided
    if (updates.status) {
      const statusArr = Array.isArray(updates.status) ? updates.status : [updates.status];
      const invalid = statusArr.some((s) => !ALLOWED_STATUSES.includes(s));
      if (invalid) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
    }

    // If someone tries to set approved=true, ensure only staff can do that
    const wantsApproveTrue = updates.hasOwnProperty("approved") && updates.approved === true;
    if (wantsApproveTrue && userType !== "staff") {
      return res.status(403).json({ success: false, message: "Only staff can approve loans/returns" });
    }

    // Determine whether this request is a return request (member initiating return)
    const incomingStatus = updates.status;
    const wantsReturn =
      (updates.return_date && !loan.return_date) ||
      (Array.isArray(incomingStatus) && incomingStatus.includes("returned")) ||
      (typeof incomingStatus === "string" && incomingStatus === "returned");

    // Helper: perform the return logic (idempotent)
    const doReturnLogic = async (sessionArg = null) => {
      const alreadyReturned = Boolean(loan.return_date);
      if (!alreadyReturned) {
        loan.return_date = updates.return_date || new Date();
        loan.status = ["returned"];
        loan.approved = false; // return must be approved by staff later (your business rule)
        // increment book.available
        const book = await Book.findById(loan.book_id).session(sessionArg);
        if (book) {
          if (typeof book.available !== "number") book.available = 0;
          book.available = book.available + 1;
          await book.save({ session: sessionArg });
        }
      } else {
        // idempotent: ensure fields exist but do not change inventory
        loan.return_date = loan.return_date || updates.return_date || loan.return_date;
        loan.status = ["returned"];
        loan.approved = false;
      }
    };

    // If staff is approving (approved: true) we need special logic:
    // - If loan.status includes "returned" => finalize return (set approved = true, record staff)
    // - If loan.status includes "reserved" => convert to borrowed, decrement book.available, set borrow/due dates
    if (wantsApproveTrue) {
      // start a transaction if available (recommended for inventory changes)
      session = await mongoose.startSession();
      try {
        session.startTransaction();

        // re-load loan within session to be safe
        const loanForApprove = await Loan.findById(id).session(session);
        if (!loanForApprove) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ success: false, message: "Loan not found (during approve)" });
        }

        // If returned -> mark approved true
        const statusArr = Array.isArray(loanForApprove.status) ? loanForApprove.status : [loanForApprove.status];
        if (statusArr.includes("returned")) {
          loanForApprove.approved = true;
          loanForApprove.staff_id = user?._id || loanForApprove.staff_id;
          await loanForApprove.save({ session });
        } else if (statusArr.includes("reserved")) {
          // Approving a reservation -> checkout the book
          const book = await Book.findById(loanForApprove.book_id).session(session);
          if (!book) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Book not found for loan" });
          }
          if (!book.available || book.available <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "No available copies to approve loan" });
          }

          // Convert to borrowed
          loanForApprove.status = ["borrowed"];
          loanForApprove.approved = true;
          loanForApprove.borrow_date = updates.borrow_date || new Date();
          // set due_date if provided, else default (example 14 days)
          loanForApprove.due_date = updates.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          loanForApprove.staff_id = user?._id || loanForApprove.staff_id;

          // decrement inventory
          book.available = Math.max(0, (book.available || 1) - 1);
          await book.save({ session });

          await loanForApprove.save({ session });
        } else {
          // fallback: just set approved true
          loanForApprove.approved = true;
          loanForApprove.staff_id = user?._id || loanForApprove.staff_id;
          await loanForApprove.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        const populated = await Loan.findById(id)
          .populate("book_id", "title author genre")
          .populate("member_id", "name email")
          .populate("staff_id", "full_name email");

        return res.json({ success: true, data: populated });
      } catch (err) {
        if (session) {
          try {
            await session.abortTransaction();
          } catch (e) {}
          session.endSession();
        }
        console.error("approve (updateLoan) error:", err);
        return res.status(400).json({ success: false, message: err.message || "Approve failed" });
      }
    }

    // Non-approve paths:
    if (session) {
      // If we created a session earlier (unlikely here), end it since not used
      try { session.endSession(); } catch (e) {}
      session = null;
    }

    // If this is a member return or other return operation -> run return logic
    if (wantsReturn) {
      await doReturnLogic(null);
    } else {
      // Normal updates (notes, status, due_date, borrow_date, approved=false etc.)
      if (updates.status) loan.status = updates.status;
      if (updates.notes) loan.notes = updates.notes;
      if (updates.due_date) loan.due_date = updates.due_date;
      if (typeof updates.approved === "boolean") loan.approved = updates.approved;
      if (updates.borrow_date) loan.borrow_date = updates.borrow_date;
      if (updates.return_date && !loan.return_date) loan.return_date = updates.return_date;
    }

    await loan.save();

    const populated = await Loan.findById(id)
      .populate("book_id", "title author genre")
      .populate("member_id", "name email")
      .populate("staff_id", "full_name email");

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("updateLoan error:", err);
    if (session) {
      try { await session.abortTransaction(); } catch (e) {}
      try { session.endSession(); } catch (e) {}
    }
    return res.status(500).json({ success: false, message: err.message });
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
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
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
export const rejectLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const userType = req.userType; // set in your auth middleware

    // Only staff can reject a loan
    if (userType === "member") {
      return res.status(403).json({
        success: false,
        message: "Only staff can reject loans",
      });
    }

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    // Find the loan
    const loan = await Loan.findById(id);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }

    // Figure out current status(es)
    const statusArr = Array.isArray(loan.status)
      ? loan.status
      : loan.status
      ? [loan.status]
      : [];

    
    if (statusArr.includes("returned")) {
      return res.status(400).json({
        success: false,
        message: "Cannot reject a loan that has already been returned",
      });
    }

    // Load the book so we can adjust availability
    const book = await Book.findById(loan.book_id);

    
    const shouldIncrementAvailability =
      book &&
      (statusArr.includes("reserved") );

    if (book && shouldIncrementAvailability) {
     
      book.available = book.available + 1;
      await book.save();
    }

    
    await Loan.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Loan rejected and deleted successfully",
    });
  } catch (err) {
    console.error("rejectLoan error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};