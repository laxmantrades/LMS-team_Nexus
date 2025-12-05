// services/fines.service.js
import Loan from "../models/loan.model.js";

import { upsertFineForLoan } from "../controllers/fine.controller.js";

export async function runFineSweep() {
  const now = new Date();

  const loans = await Loan.find({
    due_date: { $lt: now },
    return_date: { $exists: false },
  }).select("_id borrow_date due_date return_date member_id book_id");

  let updated = 0;
  for (const loan of loans) {
    const fine = await upsertFineForLoan(loan);
    if (fine) updated++;
  }

  return {
    processed_loans: loans.length,
    updated_fines: updated,
  };
}