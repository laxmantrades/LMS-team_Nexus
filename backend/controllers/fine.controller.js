import mongoose from "mongoose";
import Fine from "../models/fine.model.js";
import Loan from "../models/loan.model.js";
import Member from "../models/member.model.js"

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


const BASE_FINE = Number(process.env.FINE_BASE_AMOUNT || 10); 
const DAY_MS = 24 * 60 * 60 * 1000;

function daysOverdue(loan) {
  const end = loan.return_date ? new Date(loan.return_date) : new Date();
  const diffDays = Math.floor((end - new Date(loan.due_date)) / DAY_MS);
  return Math.max(0, diffDays);
}


function multiplierForOverdue(overdueDays) {
  if (overdueDays <= 0) return 0;
  return Math.ceil(overdueDays / 30);
}


export async function upsertFineForLoan(loan) {
  const overdue = daysOverdue(loan);
  
  
  const mult = multiplierForOverdue(overdue);
  if (mult === 0) return null; // not overdue yet

  const amount_due = BASE_FINE * mult;

  
  const existing = await Fine.findOne({ loan_id: loan._id });

  if (!existing) {
   
    return await Fine.create({
      loan_id: loan._id,
      amount_due,
      calculated_on: new Date(),
      status: "unpaid",
      is_capped: false, 
      notes: `Auto-generated ${mult}x fine for ${overdue} days overdue.`,
    });
  }

  
  if (existing.status === "paid") return existing;

  
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


export const sweepFines = async (_req, res) => {
  try {
    const now = new Date();
    const loans = await Loan.find({
      due_date: { $lt: now }, 
      return_date: { $exists: false }, 
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


export const getFines = async (req, res) => {
  try {
    const { page = 1, limit = 10, loan_id, status, member_id } = req.query;

    const filter = {};
    if (loan_id && isObjectId(loan_id)) filter.loan_id = loan_id;
    if (status) filter.status = status; 

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


// in your fines controller file

export const getMyFines = async (req, res) => {
  try {
    const userId = req.user?._id; // from auth middleware
    
    

    if (!userId || !isObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // 1. Get all loans for this member
    const loans = await Loan.find({ member_id: userId }).select("_id");
    const loanIds = loans.map((l) => l._id);

    if (loanIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        total_due: 0,
      });
    }
    
    

    // 2. Get all fines for these loans (you can filter unpaid only if you want)
    const fines = await Fine.find({
      loan_id: { $in: loanIds },
      // status: "unpaid", // uncomment if you only want unpaid fines
    }).populate({
      path: "loan_id",
      select: "borrow_date due_date return_date member_id book_id",
      populate: [
        { path: "member_id", select: "name email" },
        { path: "book_id", select: "title author" },
      ],
    });

    const total_due = fines
      .filter((f) => f.status !== "paid")
      .reduce((sum, f) => sum + (f.amount_due || 0), 0);

    res.json({
      success: true,
      data: fines,
      total_due,
    });
  } catch (err) {
    console.error("getMyFines error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


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
export const getFinesByEmail = async (req, res) => {
  try {
    const { email, page = 1, limit = 10, unpaidOnly = "false" } = req.query;

    if (!email || typeof email !== "string" || email.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Query param 'email' is required." });
    }

    
    const member = await Member.findOne({
      email: { $regex: `^${email.trim()}$`, $options: "i" },
    }).select("_id name email");

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found with that email." });
    }

  
    const loans = await Loan.find({ member_id: member._id }).select("_id");
    const loanIds = loans.map((l) => l._id);

    if (loanIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        total_due: 0,
        pagination: { total: 0, page: Number(page), pages: 0, limit: Number(limit) },
      });
    }

    
    const filter = { loan_id: { $in: loanIds } };
    if (unpaidOnly === "true" || unpaidOnly === true) {
     
      filter.status = { $in: ["unpaid", "partial"] };
    }

    const numericLimit = Math.min(Number(limit) || 10, 200);
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

  
    const total_due = items
      .filter((f) => f.status !== "paid")
      .reduce((s, f) => s + (f.amount_due || 0), 0);

    return res.json({
      success: true,
      member: { _id: member._id, name: member.name, email: member.email },
      data: items,
      total_due,
      pagination: {
        total,
        page: numericPage,
        pages: Math.max(1, Math.ceil(total / numericLimit)),
        limit: numericLimit,
      },
    });
  } catch (err) {
    console.error("getFinesByEmail error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUnpaidFines = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);

    const fines = await Fine.find({ status: "unpaid" })
      .populate({
        path: "loan_id",
        populate: [
          { path: "book_id", select: "title author" },
          { path: "member_id", select: "name email" } 
        ],
      })
    
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const total_due = fines.reduce((sum, f) => sum + (f.amount_due || 0), 0);

    return res.json({ data: fines, total_due });
  } catch (err) {
    console.error("getUnpaidFines error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

