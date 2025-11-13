import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const FineSchema = new mongoose.Schema(
  {
    loan_id: { type: ObjectId, ref: "Loan", required: true },
    amount_due: { type: Number, required: true, min: 0 },
    calculated_on: { type: Date, default: Date.now },
    status: { type: [String], default: [] }, 
    is_capped: { type: Boolean, default: false },
    notes: { type: String, trim: true }
  },
  { timestamps: true, collection: "fines" }
);

FineSchema.index({ loan_id: 1 });

export default mongoose.model("Fine", FineSchema);