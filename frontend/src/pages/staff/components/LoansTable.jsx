import React from "react";

const fmtDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };
const LoansTable = ({
    loans,
    loading,
    error,
    returningId,
    onReturn,
  }) => {
    if (loading) return <div className="text-gray-600">Loading loans...</div>;
    if (error) return <div className="text-red-600">Error: {error}</div>;
    if (!loading && loans.length === 0)
      return <div className="text-gray-600">You have no loans or reservations.</div>;
  
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2">Book</th>
              <th className="py-2">Status</th>
              <th className="py-2">Borrowed</th>
              <th className="py-2">Due</th>
              <th className="py-2">Returned</th>
              <th className="py-2">Handled by</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const statusArr = Array.isArray(loan.status) ? loan.status : [loan.status];
              const isOverdue = statusArr.includes("overdue");
              const canReturn = !loan.return_date && !isOverdue && statusArr.some((s) => ["reserved", "borrowed"].includes(s));
              const isReturning = String(returningId) === String(loan._id);
              const hasReturnedStatus = statusArr.includes("returned");
              const hasPendingMarker = statusArr.includes("pending");
              const isApproved = Boolean(loan.approved);
  
              return (
                <tr
                  key={loan._id}
                  className={`border-b border-gray-100 ${isOverdue && !loan.return_date ? "bg-red-50" : ""}`}
                >
                  <td className="py-2">
                    <div className="font-medium">{loan.book_id?.title ?? "—"}</div>
                    <div className="text-xs text-gray-600">{loan.book_id?.author ?? ""}</div>
                  </td>
  
                  <td className="py-2">
                    {statusArr.join(", ")}
                    {hasReturnedStatus && !isApproved && !hasPendingMarker && (
                      <span className="ml-2 text-xs text-yellow-700"> (pending approval)</span>
                    )}
                  </td>
  
                  <td className="py-2">{fmtDate(loan.borrow_date ?? loan.createdAt)}</td>
                  <td className="py-2">{fmtDate(loan.due_date)}</td>
                  <td className="py-2">{fmtDate(loan.return_date)}</td>
                  <td className="py-2">{loan.staff_id ? loan.staff_id.full_name || loan.staff_id.email : "-"}</td>
  
                  <td className="py-2">
                    {isOverdue && !loan.return_date ? (
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="inline-flex items-center rounded px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold">Overdue – in-library return only</span>
                        <p className="text-xs text-red-700">Please visit the library to return this book and pay your fine.</p>
                      </div>
                    ) : isReturning ? (
                      <button disabled className="px-3 py-1 bg-yellow-500 text-white rounded text-sm opacity-90">Pending...</button>
                    ) : canReturn ? (
                      <button onClick={() => onReturn(loan)} disabled={returningId !== null} className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-60">Return</button>
                    ) : hasReturnedStatus ? (
                      !isApproved ? (
                        <span className="inline-flex items-center gap-2 rounded px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium">Pending</span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded px-2 py-1 bg-green-100 text-green-800 text-xs font-medium">Returned</span>
                      )
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  export default LoansTable