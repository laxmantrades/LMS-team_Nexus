
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

const Loading = () => <div className="text-sm text-gray-600">Loading…</div>;
const ErrorBox = ({ text }) => <div className="text-sm text-red-600">{text}</div>;

const PendingReturns = ({ pageSize = 50 }) => {
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchPendingReturns();
 
  }, []);

  const fetchPendingReturns = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = `?status=returned&approved=false&limit=${pageSize}`;
      const res = await fetch(`${API_BASE}/loans${q}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch pending returns");
      setItems(json.data ?? []);
    } catch (err) {
      console.error("fetchPendingReturns error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };


  const handleApproveReturn = async (loanId) => {
    if (!loanId) return;
    if (!window.confirm("Approve this returned book? This will mark the return as approved.")) return;

    
    setActionLoadingId(loanId);

   
    try {
      const res = await fetch(`${API_BASE}/loans/${loanId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Approve failed");

      
      const updatedLoan = json.data ?? json.loan ?? null;

      setItems((prev) =>
        prev.map((l) => {
          if (String(l._id) !== String(loanId)) return l;
          if (updatedLoan) return updatedLoan;
          return { ...l, approved: true };
        })
      );
    } catch (err) {
      console.error("approve return error:", err);
      alert(err.message || "Server error while approving return");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefresh = () => fetchPendingReturns();

  return (
    <div className="mt-6">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-medium text-indigo-100">Pending Returns</h3>
    <div className="flex gap-2">
      <button
        onClick={handleRefresh}
        className="px-3 py-1 bg-slate-900 border border-slate-700 text-sm rounded text-slate-100 hover:bg-slate-800"
      >
        Refresh
      </button>
    </div>
  </div>

  <div className="bg-slate-900/80 border border-slate-800 rounded overflow-x-auto">
    {loading && (
      <div className="p-4">
        <Loading />
      </div>
    )}
    {error && (
      <div className="p-4">
        <ErrorBox text={error} />
      </div>
    )}

    {!loading && !error && items.length === 0 && (
      <div className="p-4 text-sm text-slate-400">
        No pending returns found.
      </div>
    )}

    {!loading && items.length > 0 && (
      <table className="w-full text-left text-sm text-slate-200">
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
            <th className="p-2">Book</th>
            <th className="p-2">Member</th>
            <th className="p-2">Returned</th>
            <th className="p-2">Handled by</th>
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((loan) => {
            const book = loan.book_id ?? {};
            const member = loan.member_id ?? {};
            const staff = loan.staff_id ?? {};
            const returnedAt = loan.return_date
              ? new Date(loan.return_date).toLocaleString()
              : "-";
            const isApproving = actionLoadingId === loan._id;

            return (
              <tr
                key={loan._id}
                className="border-b border-slate-800 hover:bg-slate-800/60"
              >
                <td className="p-2">
                  <div className="font-medium text-slate-100">
                    {book.title ?? "—"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {book.author ?? ""}
                  </div>
                </td>

                <td className="p-2 text-sm text-slate-200">
                  {member.name ?? member.email ?? "—"}
                </td>

                <td className="p-2 text-sm text-slate-300">
                  {returnedAt}
                </td>

                <td className="p-2 text-sm text-slate-300">
                  {staff.full_name ?? staff.email ?? "-"}
                </td>

                <td className="p-2 text-right">
                 
                  {loan.approved ? (
                    <span className="inline-flex items-center gap-2 rounded px-2 py-1 bg-emerald-900/60 text-emerald-200 text-xs font-medium">
                      Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApproveReturn(loan._id)}
                      disabled={!!actionLoadingId}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs disabled:opacity-60"
                      title="Approve returned book"
                    >
                      {isApproving ? "Approving…" : "Approve Return"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
</div>

  );
};

export default PendingReturns;
