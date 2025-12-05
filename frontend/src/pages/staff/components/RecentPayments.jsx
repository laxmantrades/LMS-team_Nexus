// src/components/RecentPayments.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

const Loading = () => <div className="text-sm text-gray-600">Loading…</div>;
const ErrorBox = ({ text }) => (
  <div className="text-sm text-red-600">{text}</div>
);

const RecentPayments = ({ pageSize = 50 }) => {
  const [items, setItems] = useState([]);      // list of payments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0); // total from backend

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/payment`, {
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch payments");

      const data = json.data ?? [];

      // total from backend (all payments)
      setTotalPaid(json.total_paid || 0);

      // if there are many payments, just keep the most recent pageSize
      const recent = data.slice(0, pageSize);
      setItems(recent);
    } catch (err) {
      console.error("fetchPayments error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchPayments();

  // optional: total only for the currently displayed rows
  const pageTotal = items.reduce(
    (sum, p) => sum + (p.amount_paid || 0),
    0
  );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-medium text-indigo-100">
            Recent Payments
          </h3>
          <p className="text-sm text-slate-400">
            Total Collected (all time):{" "}
            <span className="text-emerald-400 font-semibold">
              {totalPaid.toFixed(2)} DKK
            </span>
            <span className="ml-3 text-xs text-slate-500">
              (This page: {pageTotal.toFixed(2)}DKK)
            </span>
          </p>
        </div>

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
            No payments found.
          </div>
        )}

        {!loading && items.length > 0 && (
          <table className="w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                <th className="p-2">Member</th>
                <th className="p-2">Book</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Method</th>
                <th className="p-2">Status</th>
                <th className="p-2">Paid on</th>
                <th className="p-2">Handled by</th>
              </tr>
            </thead>

            <tbody>
              {items.map((payment) => {
                const fine = payment.fine_id ?? {};
                const loan = fine.loan_id ?? {};
                const book = loan.book_id ?? {};
                const member = payment.member_id ?? {};
                const staff = payment.staff_id ?? {};

                const paidOn = payment.paid_on
                  ? new Date(payment.paid_on).toLocaleString()
                  : "-";

                return (
                  <tr
                    key={payment._id}
                    className="border-b border-slate-800 hover:bg-slate-800/60"
                  >
                    {/* Member */}
                    <td className="p-2 text-sm text-slate-200 whitespace-nowrap">
                      {member.name ?? member.email ?? "—"}
                    </td>

                    {/* Book */}
                    <td className="p-2">
                      <div className="font-medium text-slate-100">
                        {book.title ?? "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {book.author ?? ""}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-2 text-sm text-slate-200 whitespace-nowrap">
                      {typeof payment.amount_paid === "number"
                        ? `${payment.amount_paid.toFixed(2)}DKK`
                        : payment.amount_paid ?? "—"}
                    </td>

                    {/* Method */}
                    <td className="p-2 text-sm text-slate-300 whitespace-nowrap">
                      {payment.method ?? "-"}
                    </td>

                    {/* Status */}
                    <td className="p-2 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-emerald-900/60 text-emerald-200"
                            : "bg-amber-900/60 text-amber-200"
                        }`}
                      >
                        {payment.status ?? "unknown"}
                      </span>
                    </td>

                    {/* Paid date */}
                    <td className="p-2 text-sm text-slate-300 whitespace-nowrap">
                      {paidOn}
                    </td>

                    {/* Staff */}
                    <td className="p-2 text-sm text-slate-300 whitespace-nowrap">
                      {staff.full_name ?? staff.email ?? "-"}
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

export default RecentPayments;
