// src/components/OverdueLoans.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

const Loading = () => <div className="text-sm text-gray-600">Loading…</div>;
const ErrorBox = ({ text }) => <div className="text-sm text-red-600">{text}</div>;

const OverdueLoans = ({ pageSize = 50 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverdue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOverdue = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = `?overdue=true&approved=true&limit=${pageSize}`;
      const res = await fetch(`${API_BASE}/loans${q}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch overdue loans");
      setItems(json.data ?? []);
    } catch (err) {
      console.error("fetchOverdue error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (due) => {
    if (!due) return false;
    return new Date(due) < new Date();
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Overdue Loans</h3>
        <button
          onClick={fetchOverdue}
          className="px-3 py-1 bg-white border rounded text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="bg-gray-50 border rounded overflow-x-auto">
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
          <div className="p-4 text-sm text-gray-600">No overdue loans found.</div>
        )}

        {!loading && items.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white border-b">
                <th className="p-2">Book</th>
                <th className="p-2">Member</th>
                <th className="p-2">Borrowed at</th>
                <th className="p-2">Due date</th>
                <th className="p-2">Days Overdue</th>
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
                  : "-";

                const due = loan.due_date ? new Date(loan.due_date) : null;

                const overdueDays = due
                  ? Math.ceil((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <tr
                    key={loan._id}
                    className={`border-b ${
                      isOverdue(loan.due_date)
                        ? "bg-red-50 text-red-800"
                        : ""
                    }`}
                  >
                    <td className="p-2">
                      <div className="font-medium">{book.title ?? "—"}</div>
                      <div className="text-xs text-gray-600">{book.author ?? ""}</div>
                    </td>

                    <td className="p-2 text-sm">
                      {member.name ?? member.email ?? "—"}
                    </td>

                    <td className="p-2 text-sm">{borrowedAt}</td>

                    <td className="p-2 text-sm">
                      {loan.due_date
                        ? new Date(loan.due_date).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-2 text-sm font-semibold">
                      {overdueDays > 0 ? `${overdueDays} days` : "-"}
                    </td>

                    <td className="p-2 text-sm">
                      {staff.full_name ?? staff.email ?? "-"}
                    </td>

                    <td className="p-2 text-sm break-words" style={{ maxWidth: 300 }}>
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

export default OverdueLoans;
