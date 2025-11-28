// models/Payment.js
import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const PaymentSchema = new mongoose.Schema(
  {
    fine_id: { type: ObjectId, ref: "Fine", required: true },
    member_id: { type: ObjectId, ref: "Member", required: true },
    staff_id: { type: ObjectId, ref: "Staff", required: true },
    amount_paid: { type: Number, required: true, min: 0 },
    paid_on: { type: Date, default: Date.now },
    method: { type: String, enum: ["cash", "card", "other"], default: "cash" },
    status: { type: String, enum: ["completed", "failed", "pending"], default: "completed" },
    receipt_number: { type: String, trim: true },
  },
  { timestamps: true, collection: "payments" }
);

PaymentSchema.index({ fine_id: 1, paid_on: -1 });

export default mongoose.model("Payment", PaymentSchema);
