
import React, { useEffect, useState } from "react";

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
};
// PaymentsTable component
const PaymentsTable = ({ apiBase}) => {
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/payment/mine`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to fetch payments");
        if (!mounted) return;
        setPayments(data.data || []);
        setTotalPaid(data.total_paid ?? 0);
      } catch (err) {
        console.error("fetchPayments error:", err);
        if (mounted) setError(err.message || "Server error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPayments();
    return () => {
      mounted = false;
    };
  }, [apiBase]);

  if (loading) return <div className="text-gray-600">Loading payments...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="mt-4 bg-slate-900/70 border border-slate-700 rounded p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-md font-semibold text-indigo-200">
      Payments
    </h3>
    <div className="text-sm text-slate-300">
      Total paid:{" "}
      <span className="font-bold text-indigo-100">
        {Number(totalPaid).toFixed(2)}
      </span>
    </div>
  </div>

  {payments.length === 0 ? (
    <div className="text-sm text-slate-400">No payments found.</div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-200">
        <thead>
          <tr className="border-b border-slate-700 text-slate-300">
            <th className="py-2">Receipt</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Method</th>
            <th className="py-2">Paid on</th>
            <th className="py-2">For</th>
            <th className="py-2">Handled by</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const bookTitle =
              p.fine_id?.loan_id?.book_id?.title ||
              p.fine_id?.loan_id?.book_id?.name ||
              p.fine_id?.description ||
              "Fine";
            const staffName =
              p.staff_id?.full_name || p.staff_id?.email || "-";

            return (
              <tr
                key={p._id}
                className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
              >
                <td className="py-2 text-xs text-slate-400">
                  {p.receipt_number || p._id.slice(-8)}
                </td>
                <td className="py-2 text-emerald-300">
                  {Number(p.amount_paid).toFixed(2)} DKK
                </td>
                <td className="py-2 text-slate-300">{p.method}</td>
                <td className="py-2 text-slate-400">{fmtDate(p.paid_on)}</td>
                <td className="py-2 text-xs text-slate-300">
                  {bookTitle}
                </td>
                <td className="py-2 text-slate-300">{staffName}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>

  );
};

export default PaymentsTable;
