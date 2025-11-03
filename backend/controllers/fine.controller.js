import mongoose from "mongoose";
import Fine from "../models/fine.model.js";
import Loan from "../models/loan.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---- Configurable policy ----
const BASE_FINE = Number(process.env.FINE_BASE_AMOUNT || 10); 
const DAY_MS = 24 * 60 * 60 * 1000;

function daysOverdue(loan) {
  const end = loan.return_date ? new Date(loan.return_date) : new Date();
  const diffDays = Math.floor((end - new Date(loan.due_date)) / DAY_MS);
  return Math.max(0, diffDays);
}

// Multiplier rules (unbounded):
// Overdue 1–30 days => 1×
// Overdue 31–60 days => 2×
// Overdue 61–90 days => 3×
// ...
function multiplierForOverdue(overdueDays) {
  if (overdueDays <= 0) return 0;
  return Math.ceil(overdueDays / 30);
}

// Create/Update a single fine for a given loan based on overdue age
export async function upsertFineForLoan(loan) {
  const overdue = daysOverdue(loan);
  const mult = multiplierForOverdue(overdue);
  if (mult === 0) return null; // not overdue yet

  const amount_due = BASE_FINE * mult;

  // Exactly one fine per loan (consider a unique index on Fine.loan_id)
  const existing = await Fine.findOne({ loan_id: loan._id });

  if (!existing) {
    // First time fine creation
    return await Fine.create({
      loan_id: loan._id,
      amount_due,
      calculated_on: new Date(),
      status: "unpaid",
      is_capped: false, // no cap in this policy
      notes: `Auto-generated ${mult}x fine for ${overdue} days overdue.`,
    });
  }

  // Do not modify paid fines
  if (existing.status === "paid") return existing;

  // Update unpaid fine to the current tier
  return await Fine.findByIdAndUpdate(
    existing._id,
    {
      $set: {
        amount_due,
        calculated_on: new Date(),
        is_capped: false,
        notes: `Auto-updated to ${mult}x for ${overdue} days overdue.`,
      },
    },
    { new: true }
  );
}

// -------- Public controllers --------

// Sweep: find all overdue & unreturned loans and create/update fines
export const sweepFines = async (_req, res) => {
  try {
    const now = new Date();
    const loans = await Loan.find({
      due_date: { $lt: now }, // strictly past due
      return_date: { $exists: false }, // still not returned
    }).select("_id borrow_date due_date return_date member_id book_id");

    const results = [];
    for (const loan of loans) {
      const r = await upsertFineForLoan(loan);
      if (r) results.push(r);
    }

    res.json({
      success: true,
      message: "Fine sweep completed",
      base_fine: BASE_FINE,
      processed_loans: loans.length,
      updated_fines: results.length,
      data: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// List fines with filters
export const getFines = async (req, res) => {
  try {
    const { page = 1, limit = 10, loan_id, status, member_id } = req.query;

    const filter = {};
    if (loan_id && isObjectId(loan_id)) filter.loan_id = loan_id;
    if (status) filter.status = status; // status is a string: "paid" | "unpaid"

    if (member_id && isObjectId(member_id)) {
      const memberLoans = await Loan.find({ member_id }).select("_id");
      filter.loan_id = { $in: memberLoans.map((l) => l._id) };
    }

    const numericLimit = Math.min(Number(limit) || 10, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [items, total] = await Promise.all([
      Fine.find(filter)
        .populate({
          path: "loan_id",
          select: "borrow_date due_date return_date member_id book_id",
          populate: [
            { path: "member_id", select: "name email" },
            { path: "book_id", select: "title author" },
          ],
        })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .sort("-calculated_on"),
      Fine.countDocuments(filter),
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

// Get single fine
export const getFineById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const fine = await Fine.findById(id).populate({
      path: "loan_id",
      select: "borrow_date due_date return_date member_id book_id",
      populate: [
        { path: "member_id", select: "name email" },
        { path: "book_id", select: "title author" },
      ],
    });

    if (!fine)
      return res
        .status(404)
        .json({ success: false, message: "Fine not found" });

    res.json({ success: true, data: fine });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Manual recalc for one loan
export const recalcFineForLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    if (!isObjectId(loanId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid loan ID" });
    }
    const loan = await Loan.findById(loanId);
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });

    const fine = await upsertFineForLoan(loan);
    if (!fine)
      return res.json({
        success: true,
        message: "No fine needed yet (not overdue ≥1 day).",
      });

    res.json({ success: true, data: fine });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete fine
export const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const fine = await Fine.findByIdAndDelete(id);
    if (!fine)
      return res
        .status(404)
        .json({ success: false, message: "Fine not found" });

    res.json({ success: true, message: "Fine deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};