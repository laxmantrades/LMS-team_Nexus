// src/components/staff/PaymentModal.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";

const API_BASE = "http://localhost:4000/api";

const PaymentModal = ({ fine, onClose, onSuccess }) => {
  const user = useSelector(selectAuthUser);
  const [amount, setAmount] = useState(fine.amount_due || 0);
  const [method, setMethod] = useState("cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a positive amount");
      return;
    }
    if (amt > (fine.amount_due || 0)) {
      // allow overpayment? up to you
      if (!window.confirm("Amount exceeds outstanding due. Continue?")) return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/payment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fine_id: fine._id,
          amount_paid: amt,
          method,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to record payment");

      onSuccess && onSuccess();
    } catch (err) {
      console.error("payment error:", err);
      setError(err.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
        <h3 className="text-lg font-semibold mb-3">Record Payment</h3>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Member</label>
            <div className="text-sm">{fine.member_name || fine.member_id || "Member"}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Outstanding</label>
            <div className="text-sm font-medium">{(fine.amount_due || 0).toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Amount to record</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border p-2 rounded">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-white border rounded">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-3 py-1 bg-indigo-600 text-white rounded">
              {saving ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
