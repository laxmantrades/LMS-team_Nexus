// src/components/ApprovedReservations.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

const Loading = () => <div className="text-sm text-gray-600">Loading…</div>;
const ErrorBox = ({ text }) => <div className="text-sm text-red-600">{text}</div>;

const ApprovedReservations = ({ pageSize = 50 }) => {
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApproved();
    
  }, []);

  const fetchApproved = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = `?status=borrowed&approved=true&limit=${pageSize}`;
      const res = await fetch(`${API_BASE}/loans${q}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch approved reservations");
      setItems(json.data ?? []);
    } catch (err) {
      console.error("fetchApproved error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-medium text-indigo-100">
      Approved Reservations
    </h3>
    <div>
      <button
        onClick={fetchApproved}
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
        No approved reservations found.
      </div>
    )}

    {!loading && items.length > 0 && (
      <table className="w-full text-left text-sm text-slate-200">
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
            <th className="p-2">Book</th>
            <th className="p-2">Member</th>
            <th className="p-2">Reserved at</th>
            <th className="p-2">Approved</th>
            <th className="p-2">Staff</th>
            <th className="p-2">Notes</th>
          </tr>
        </thead>

        <tbody>
          {items.map((loan) => {
            const book = loan.book_id ?? {};
            const member = loan.member_id ?? {};
            const staff = loan.staff_id ?? {};
            const reservedAt = loan.createdAt
              ? new Date(loan.createdAt).toLocaleString()
              : "-";
            const approvedAt = loan.updatedAt
              ? new Date(loan.updatedAt).toLocaleString()
              : loan.approved_at
              ? new Date(loan.approved_at).toLocaleString()
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
                  {reservedAt}
                </td>

                <td className="p-2 text-sm text-emerald-300">
                  {loan.approved ? "Yes" : "No"}{" "}
                  {loan.approved ? `• ${approvedAt}` : ""}
                </td>

                <td className="p-2 text-sm text-slate-300">
                  {staff.full_name ?? staff.email ?? "-"}
                </td>

                <td
                  className="p-2 text-sm wrap-break-words text-slate-200"
                  style={{ maxWidth: 220 }}
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

export default ApprovedReservations;
