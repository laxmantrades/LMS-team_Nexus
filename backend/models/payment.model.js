import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const PaymentSchema = new mongoose.Schema(
  {
    fine_id: { type: ObjectId, ref: "Fine", required: true },
    amount_paid: { type: Number, required: true, min: 0 },
    paid_on: { type: Date, default: Date.now },
    method: { type: String, trim: true }, // e.g., "cash","card","online"
    status: { type: String, trim: true }   // e.g., "completed","failed","refunded","pending"
  },
  { timestamps: true, collection: "payments" }
);

PaymentSchema.index({ fine_id: 1, paid_on: -1 });

export default mongoose.model("Payment", PaymentSchema);
