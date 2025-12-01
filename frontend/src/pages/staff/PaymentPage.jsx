// src/pages/staff/PaymentsPage.jsx
import React, { useEffect, useState } from "react";
import PaymentModal from "./components/PaymentModal";

// API base URL
const API_BASE = "http://localhost:4000/api";

const PaymentsPage = () => {
  const [query, setQuery] = useState("");
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [error, setError] = useState(null);

  // Fetch default unpaid fines (first 10) when page loads
  const fetchDefaultFines = async () => {
    setLoading(true);
    setError(null);
    setUnpaidFines([]);
    setMemberInfo(null);
    setTotalDue(0);

    try {
      const url = `${API_BASE}/fines/unpaid?limit=10`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to fetch default fines");

      // expected shape: { data: [...], total_due }
      setUnpaidFines(data.data || []);
      setTotalDue(Number(data.total_due || 0));
    } catch (err) {
      console.error("fetchDefaultFines error:", err);
      setError(err.message || "Error loading fines");
    } finally {
      setLoading(false);
    }
  };

  // Search fines by email or memberId
  const fetchUnpaidFines = async () => {
    const raw = (query || "").trim();
    if (!raw) return;
    setLoading(true);
    setError(null);
    setUnpaidFines([]);
    setMemberInfo(null);
    setTotalDue(0);

    try {
      let res, data;

      if (raw.includes("@")) {
        // treat as email -> call search-by-email
        const url = `${API_BASE}/fines/search-by-email?email=${encodeURIComponent(
          raw
        )}&unpaidOnly=true`;
        res = await fetch(url, { method: "GET", credentials: "include" });
        data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to fetch fines");

        // expected shape: { success, member, data, total_due }
        setMemberInfo(data.member || null);
        setTotalDue(Number(data.total_due || 0));
        setUnpaidFines(data.data || []);
      } else {
        // treat as memberId -> call existing endpoint
        const url = `${API_BASE}/fines/member/${encodeURIComponent(raw)}`;
        res = await fetch(url, { method: "GET", credentials: "include" });
        data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to fetch fines");

        // expected shape: { success, data, total_due } or { data: [...], total_due }
        setMemberInfo(null);
        setTotalDue(Number(data.total_due || 0));
        setUnpaidFines(data.data || []);
      }
    } catch (err) {
      console.error("fetchUnpaidFines error:", err);
      setError(err.message || "Error fetching fines");
      setUnpaidFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultFines();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Record Payment (Staff)</h1>

      <div className="mb-4 flex gap-2 items-center">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Member email or member ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchUnpaidFines();
          }}
        />
        <button
          className="px-3 py-1 bg-indigo-600 text-white rounded"
          onClick={fetchUnpaidFines}
          disabled={loading}
        >
          {loading ? "Searching..." : "Find Fines"}
        </button>
      </div>

      {error && <div className="mb-3 text-sm text-red-600">Error: {error}</div>}

      {memberInfo && (
        <div className="mb-3 p-3 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-600">Member</div>
          <div className="font-medium">{memberInfo.name || "Unknown"}</div>
          <div className="text-xs text-gray-500">{memberInfo.email}</div>
          <div className="mt-1 text-sm">
            Outstanding total:{" "}
            <span className="font-semibold">{Number(totalDue || 0).toFixed(2)}</span>
          </div>
        </div>
      )}

      {!loading && unpaidFines.length === 0 && !error && (
        <div className="text-gray-600">No unpaid fines found for this member.</div>
      )}

      {unpaidFines.length > 0 && (
        <ul className="space-y-2">
          {unpaidFines.map((fine) => (
            <li
              key={fine._id}
              className="flex justify-between bg-white p-3 rounded shadow-sm"
            >
              <div>
                <div className="font-medium">
                  {fine.description || fine.loan_id?.book_id?.title || "Fine"}
                </div>
                <div className="text-xs text-gray-500">
                  Due: {(fine.amount_due || 0).toFixed(2)} • Status: {fine.status || "unpaid"}
                </div>
                {fine.loan_id && fine.loan_id.member_id && (
                  <div className="text-xs text-gray-400">
                    Member: {fine.loan_id.member_id.name || fine.loan_id.member_id.email}
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setSelectedFine(fine)}
                  className="px-3 py-1 rounded bg-green-600 text-white"
                  disabled={fine.status === "paid"}
                >
                  Record Payment
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedFine && (
        <PaymentModal
          fine={selectedFine}
          onClose={() => setSelectedFine(null)}
          onSuccess={() => {
            // refresh unpaid fines after payment
            // if a search is active, re-run search; otherwise refresh default list
            if ((query || "").trim()) {
              fetchUnpaidFines();
            } else {
              fetchDefaultFines();
            }
            setSelectedFine(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
