// routes/payments.js
import express from "express";
import mongoose from "mongoose";
import fineModel from "../models/fine.model.js";
import paymentModel from "../models/payment.model.js";
import Loan from "../models/loan.model.js"
import Book from "../models/book.model.js"
// example middleware

const router = express.Router();



export const createpayment = async (req, res) => {
  const { fine_id, method } = req.body;
  const staffId = req.user && req.user._id;

  if (!fine_id) {
    return res.status(400).json({ message: "fine_id is required." });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    
    const fine = await fineModel.findById(fine_id).session(session);
    if (!fine) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Fine not found." });
    }

    // Use server-side amount from fine (do NOT rely on client input)
    const amt = Number(fine.amount_due || 0);
    if (!amt || Number.isNaN(amt) || amt <= 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "This fine has no outstanding amount to pay." });
    }

   
    let memberId = fine.member_id || fine.user_id || fine.user;
    let loan = null;
    if (!memberId && fine.loan_id) {
      loan = await Loan.findById(fine.loan_id)
        .session(session)
        .select("member_id book_id status return_date");
      if (!loan) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Loan not found for fine." });
      }
      memberId = loan.member_id;
    }

    if (!memberId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Could not determine member for this fine." });
    }
// 3) create payment (amount is taken from fine)
    const receiptNumber = `R-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const [payment] = await paymentModel.create(
      [
        {
          fine_id: fine._id,
          member_id: memberId,
          staff_id: staffId,
          amount_paid: amt,
          method: method || "cash",
          status: "completed",
          receipt_number: receiptNumber,
        },
      ],
      { session }
    );

   
    const newDue = Math.max(0, (fine.amount_due || 0) - amt);
    fine.amount_due = newDue;
    fine.status = newDue <= 0 ? "paid" : "partial";

    if (Array.isArray(fine.payments)) {
      fine.payments.push(payment._id);
    }

    await fine.save({ session });

   
    if (!loan && fine.loan_id) {
      loan = await Loan.findById(fine.loan_id).session(session);
    }

    if (loan) {
     
      loan.status = ["returned"];
      loan.return_date = new Date();
      loan.approved = true; 
      await loan.save({ session });

      if (loan.book_id) {
        await Book.findByIdAndUpdate(
          loan.book_id,
          { $inc: { available: 1 } },
          { session }
        );
      }
    }

  
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Payment recorded. Fine paid, loan marked returned, book availability updated.",
      payment,
      fine,
    });
  } catch (err) {
 
    try {
      await session.abortTransaction();
    } catch (e) {
      
    }
    session.endSession();
    console.error("createPayment error:", err);
    return res.status(500).json({ message: "Server error creating payment." });
  }
};


// optionally: list payments for a member
//router.get("/member/:memberId", requireStaff,

export const listmyPayments = async (req, res) => {
  try {
    const payments = await paymentModel
      .find({ member_id: req.params.memberId })
      .sort({ paid_on: -1 });
    res.json({ data: payments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
;

export const getMyPayments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const memberId = req.user._id;

    
    const payments = await paymentModel.find({ member_id: memberId })
      .populate({
        path: "fine_id",
        populate: {
          path: "loan_id",
          populate: { path: "book_id", select: "title author" },
        },
      })
      .populate("staff_id", "full_name email")
      .sort({ paid_on: -1 })
      .lean();

    const total_paid = payments.reduce((s, p) => s + (p.amount_paid || 0), 0);

    return res.json({ data: payments, total_paid });
  } catch (err) {
    console.error("getMyPayments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get ALL payments in system (admin/staff)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentModel
      .find()
      .populate("member_id", "name email")
      .populate("staff_id", "full_name email")
      .populate({
        path: "fine_id",
        populate: {
          path: "loan_id",
          populate: {
            path: "book_id",
            select: "title author",
          },
        },
      })
      .sort({ paid_on: -1 })
      .lean();

    const total_paid = payments.reduce(
      (sum, p) => sum + (p.amount_paid || 0),
      0
    );

    res.status(200).json({
      total_records: payments.length,
      total_paid,
      data: payments,
    });
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ message: "Server error fetching payments" });
  }
};
