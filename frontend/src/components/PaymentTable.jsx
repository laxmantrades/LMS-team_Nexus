// src/components/PaymentsTable.jsx
import React, { useEffect, useState } from "react";

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
};

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
    <div className="mt-4 bg-white border border-gray-100 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold">Payments</h3>
        <div className="text-sm">
          Total paid:{" "}
          <span className="font-bold text-gray-800">{Number(totalPaid).toFixed(2)}</span>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-sm text-gray-600">No payments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b">
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
                const staffName = p.staff_id?.full_name || p.staff_id?.email || "-";
                return (
                  <tr key={p._id} className="border-b last:border-b-0">
                    <td className="py-2 text-xs">{p.receipt_number || p._id.slice(-8)}</td>
                    <td className="py-2">{Number(p.amount_paid).toFixed(2)}</td>
                    <td className="py-2">{p.method}</td>
                    <td className="py-2">{fmtDate(p.paid_on)}</td>
                    <td className="py-2 text-xs">{bookTitle}</td>
                    <td className="py-2">{staffName}</td>
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
