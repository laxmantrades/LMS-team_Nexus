
import React, { useEffect, useState } from "react";
import PaymentModal from "./components/PaymentModal";


const API_BASE = "http://localhost:4000/api";

const PaymentsPage = () => {
  const [query, setQuery] = useState("");
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [error, setError] = useState(null);


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

      
      setUnpaidFines(data.data || []);
      setTotalDue(Number(data.total_due || 0));
    } catch (err) {
      console.error("fetchDefaultFines error:", err);
      setError(err.message || "Error loading fines");
    } finally {
      setLoading(false);
    }
  };

  
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

     
        
        const url = `${API_BASE}/fines/search-by-email?email=${encodeURIComponent(
          raw
        )}&unpaidOnly=true`;
        res = await fetch(url, { method: "GET", credentials: "include" });
        data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to fetch fines");

      
        setMemberInfo(data.member || null);
        setTotalDue(Number(data.total_due || 0));
        setUnpaidFines(data.data || []);
       
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
    <div className="p-4 text-slate-100">
  <h1 className="text-xl font-bold mb-4 text-indigo-100">
    Record Payment (Staff)
  </h1>

  <div className="mb-4 flex gap-2 items-center">
    <input
      className="border border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 p-2 rounded flex-1"
      placeholder="Member email or member ID"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") fetchUnpaidFines();
      }}
    />
    <button
      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-60"
      onClick={fetchUnpaidFines}
      disabled={loading}
    >
      {loading ? "Searching..." : "Find Fines"}
    </button>
  </div>

  {error && (
    <div className="mb-3 text-sm text-rose-400">
      Error: {error}
    </div>
  )}

  {memberInfo && (
    <div className="mb-3 p-3 bg-slate-900/70 rounded shadow-sm border border-slate-700">
      <div className="text-sm text-slate-400">Member</div>
      <div className="font-medium text-slate-100">
        {memberInfo.name || "Unknown"}
      </div>
      <div className="text-xs text-slate-500">
        {memberInfo.email}
      </div>
      <div className="mt-1 text-sm text-slate-200">
        Outstanding total:{" "}
        <span className="font-semibold text-rose-300">
          {Number(totalDue || 0).toFixed(2)}
        </span>
      </div>
    </div>
  )}

  {!loading && unpaidFines.length === 0 && !error && (
    <div className="text-slate-400">
      No unpaid fines found for this member.
    </div>
  )}

  {unpaidFines.length > 0 && (
    <ul className="space-y-2">
      {unpaidFines.map((fine) => (
        <li
          key={fine._id}
          className="flex justify-between bg-slate-900/70 p-3 rounded shadow-sm border border-slate-800"
        >
          <div>
            <div className="font-medium text-slate-100">
              {fine.description ||
                fine.loan_id?.book_id?.title ||
                "Fine"}
            </div>
            <div className="text-xs text-slate-400">
              Due: {(fine.amount_due || 0).toFixed(2)} • Status:{" "}
              {fine.status || "unpaid"}
            </div>
            {fine.loan_id && fine.loan_id.member_id && (
              <div className="text-xs text-slate-500">
                Member:{" "}
                {fine.loan_id.member_id.name ||
                  fine.loan_id.member_id.email}
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setSelectedFine(fine)}
              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-emerald-900/60 disabled:text-emerald-300 disabled:cursor-not-allowed"
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
