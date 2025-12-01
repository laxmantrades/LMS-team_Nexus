import React from "react";
//fine summary component
const FinesSummary = ({ fineLoading, fineError, fineTotal, myFines }) => (
  <div className="mt-6 border-t border-gray-200 pt-4">
    <h3 className="text-sm font-medium text-gray-700 mb-2">Fines</h3>

    {fineLoading && <p className="text-xs text-gray-500">Loading fines...</p>}
    {fineError && <p className="text-xs text-red-600">Error: {fineError}</p>}

    {!fineLoading && !fineError && (
      <>
        <p className="text-sm">
          <span className="font-semibold">Total outstanding: </span>
          {fineTotal > 0 ? (
            <span className="text-red-600 font-bold">
              {Number(fineTotal).toFixed(2)}
              <span className="block text-xs font-normal">
                Please visit the library to return this book and pay your fine.
              </span>
            </span>
          ) : (
            <span className="text-green-600 font-semibold">0 (no fines)</span>
          )}
        </p>

        {myFines.length > 0 && (
          <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs text-gray-700">
            {myFines.map((fine) => (
              <li key={fine._id} className="flex justify-between">
                <span>
                  {fine.loan_id?.book_id?.title || "Unknown book"}{" "}
                  {fine.status === "paid" && (
                    <span className="text-green-600"> (paid)</span>
                  )}
                </span>
                <span>
                  {typeof fine.amount_due === "number"
                    ? fine.amount_due.toFixed(2)
                    : fine.amount_due}
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
