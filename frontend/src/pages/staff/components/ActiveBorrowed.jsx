
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

const Loading = () => <div className="text-sm text-gray-600">Loading…</div>;
const ErrorBox = ({ text }) => <div className="text-sm text-red-600">{text}</div>;

const ActiveBorrowed = ({ pageSize = 50 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveBorrowed();
    
  }, []);

  const fetchActiveBorrowed = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = `?status=borrowed&approved=true&limit=${pageSize}`;
      const res = await fetch(`${API_BASE}/loans${q}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch borrowed loans");
      setItems(json.data ?? []);
    } catch (err) {
      console.error("fetchActiveBorrowed error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-medium text-indigo-100">Active Borrowed</h3>
      <div>
        <button
          onClick={fetchActiveBorrowed}
          className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-slate-100 hover:bg-slate-800"
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
          No active borrowed books found.
        </div>
      )}
  
      {!loading && items.length > 0 && (
        <table className="w-full text-left text-sm text-slate-200">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="p-2">Book</th>
              <th className="p-2">Member</th>
              <th className="p-2">Borrowed at</th>
              <th className="p-2">Due date</th>
              <th className="p-2">Returned</th>
              <th className="p-2">Handled by</th>
              <th className="p-2">Notes</th>
            </tr>
          </thead>
  
          <tbody>
            {items.map((loan) => {
              const book = loan.book_id ?? {};
              const member = loan.member_id ?? {};
              const staff = loan.staff_id ?? {};
              const borrowedAt = loan.borrow_date
                ? new Date(loan.borrow_date).toLocaleString()
                : loan.createdAt
                ? new Date(loan.createdAt).toLocaleString()
                : "-";
              const dueDate = loan.due_date
                ? new Date(loan.due_date).toLocaleDateString()
                : "-";
              const returnedAt = loan.return_date
                ? new Date(loan.return_date).toLocaleString()
                : "-";
  
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
                    {borrowedAt}
                  </td>
  
                  <td className="p-2 text-sm text-slate-300">
                    {dueDate}
                  </td>
  
                  <td className="p-2 text-sm text-slate-400">
                    {returnedAt}
                  </td>
  
                  <td className="p-2 text-sm text-slate-300">
                    {staff.full_name ?? staff.email ?? "-"}
                  </td>
  
                  <td
                    className="p-2 text-sm wrap-break-word text-slate-200"
                    style={{ maxWidth: 300 }}
                  >
                    {loan.notes ?? "-"}
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

export default ActiveBorrowed;
