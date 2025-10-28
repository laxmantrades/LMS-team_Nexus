import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const LoanSchema = new mongoose.Schema(
  {
    book_id: { type: ObjectId, ref: "Book", required: true },
    member_id: { type: ObjectId, ref: "Member", required: true },
    staff_id: { type: ObjectId, ref: "Staff" }, // who handled the loan
    borrow_date: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    return_date: { type: Date },
    status: { type: [String], default: [] }, // e.g., ["borrowed"], ["returned"], ["overdue"]
    notes: { type: String, trim: true },
    fine_snapshot: { type: Number, default: 0 }, // snapshot of fine at time of close, if needed
  },
  { timestamps: true, collection: "loans" }
);

// Helpful indexes for queries
LoanSchema.index({ member_id: 1, due_date: 1 });
LoanSchema.index({ book_id: 1, return_date: 1 });

export default mongoose.model("Loan", LoanSchema);