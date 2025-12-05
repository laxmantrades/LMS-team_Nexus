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
  <div
    className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
    onClick={onClose}
  />
  <div className="relative bg-slate-900/90 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md p-6 z-10 text-slate-100">
    <h3 className="text-lg font-semibold mb-3 text-indigo-100">
      Record Payment
    </h3>

    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm text-slate-300">Member</label>
        <div className="text-sm text-slate-100">
          {fine.member_name || fine.member_id || "Member"}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300">Outstanding</label>
        <div className="text-sm font-medium text-rose-300">
          {(fine.amount_due || 0).toFixed(2)}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300">
          Amount to record
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-slate-700 bg-slate-900 text-slate-100 p-2 rounded placeholder:text-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border border-slate-700 bg-slate-900 text-slate-100 p-2 rounded"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && (
        <div className="text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 border border-slate-600 text-slate-100 rounded hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Record Payment"}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default PaymentModal;
