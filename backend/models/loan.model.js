// models/loan.model.js
import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const LoanSchema = new mongoose.Schema(
  {
    book_id: { type: ObjectId, ref: "Book", required: true },
    member_id: { type: ObjectId, ref: "Member", required: true },
    staff_id: { type: ObjectId, ref: "Staff" }, 
    borrow_date: { type: Date },                 
    due_date: { type: Date },                    
    return_date: { type: Date },
    status: { type: [String], default: ["reserved"] }, 
    notes: { type: String, trim: true },
    approved: { type: Boolean, default: false, required: true },
    
  },
  { timestamps: true, collection: "loans" }
);

LoanSchema.index({ member_id: 1, due_date: 1 });
LoanSchema.index({ book_id: 1, return_date: 1 });

export default mongoose.model("Loan", LoanSchema);
