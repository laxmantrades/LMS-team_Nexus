import React from "react";
//fine summary component
const FinesSummary = ({ fineLoading, fineError, fineTotal, myFines }) => (
  <div className="mt-6 border-t border-slate-700 pt-4">
  <h3 className="text-sm font-medium text-indigo-200 mb-2">Fines</h3>

  {fineLoading && <p className="text-xs text-slate-400">Loading fines...</p>}
  {fineError && <p className="text-xs text-rose-400">Error: {fineError}</p>}

  {!fineLoading && !fineError && (
    <>
      <p className="text-sm text-slate-200">
        <span className="font-semibold">Total outstanding: </span>
        {fineTotal > 0 ? (
          <span className="text-rose-400 font-bold">
            {Number(fineTotal).toFixed(2)}
            <span className="block text-xs font-normal text-slate-400">
              Please visit the library to return this book and pay your fine.
            </span>
          </span>
        ) : (
          <span className="text-emerald-400 font-semibold">
            0 (no fines)
          </span>
        )}
      </p>

      {myFines.length > 0 && (
        <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs text-slate-300">
          {myFines.map((fine) => (
            <li key={fine._id} className="flex justify-between">
              <span>
                {fine.loan_id?.book_id?.title || "Unknown book"}
                {fine.status === "paid" && (
                  <span className="text-emerald-400"> (paid)</span>
                )}
              </span>
              <span>
                {typeof fine.amount_due === "number"
                  ? fine.amount_due.toFixed(2)
                  : fine.amount_due} DKK
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )}
</div>

);
export default FinesSummary
