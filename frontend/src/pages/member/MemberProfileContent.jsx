// src/pages/Profile.jsx
import React,{ useCallback, useEffect, useState,useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";
import Modal from "@/components/Modal";
import FinesSummary from "@/pages/member/FinesSummary";
import LoansTable from "@/pages/staff/components/LoansTable"
import AccountCard from "@/components/AccoundCard";
import PaymentsTable from "@/components/PaymentTable";

const API_BASE = "http://localhost:4000/api";

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
};




const MemberProfileContent = () => {
  const user = useSelector(selectAuthUser);

  /* --- general state --- */
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* --- address editing --- */
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(user?.address || "");
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState(null);
  const [displayAddress, setDisplayAddress] = useState(user?.address || "");

  /* --- password modal --- */
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);

  /* --- return action --- */
  const [returningId, setReturningId] = useState(null);

  /* --- fines --- */
  const [myFines, setMyFines] = useState([]);
  const [fineTotal, setFineTotal] = useState(0);
  const [fineLoading, setFineLoading] = useState(false);
  const [fineError, setFineError] = useState(null);

  /* initialize drafts when user changes */
  useEffect(() => {
    if (!user) return;
    setAddressDraft(user.address || "");
    setDisplayAddress(user.address || "");
  }, [user]);

  /* --- fetch loans --- */
  useEffect(() => {
    if (!user || user.role !== "member") return;

    let mounted = true;
    const fetchLoans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/loans/mine`, { method: "GET", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to fetch loans");
        if (mounted) setLoans(data.data ?? []);
      } catch (err) {
        console.error("fetchLoans error:", err);
        if (mounted) setError(err.message || "Server error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLoans();
    return () => { mounted = false; };
  }, [user]);

  /* --- fetch fines --- */
  useEffect(() => {
    if (!user || user.role !== "member") return;

    let mounted = true;
    const fetchMyFines = async () => {
      setFineLoading(true);
      setFineError(null);
      try {
        const res = await fetch(`${API_BASE}/fines/myfines`, { method: "GET", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to fetch fines");
        if (mounted) {
          setMyFines(data.data || []);
          setFineTotal(data.total_due || 0);
        }
      } catch (err) {
        console.error("fetchMyFines error:", err);
        if (mounted) setFineError(err.message || "Server error");
      } finally {
        if (mounted) setFineLoading(false);
      }
    };

    fetchMyFines();
    return () => { mounted = false; };
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <h1>Please log in to view your profile</h1>
      </div>
    );

  /* --- address save --- */
  const saveAddress = useCallback(async () => {
    setAddressMessage(null);
    setAddressSaving(true);
    try {
      const res = await fetch(`${API_BASE}/members/update`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressDraft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update address");

      setAddressMessage({ type: "success", text: "Address updated." });
      setEditingAddress(false);
      setDisplayAddress(addressDraft);
      persistUserAddress(addressDraft);
    } catch (err) {
      console.error("saveAddress error:", err);
      setAddressMessage({ type: "error", text: err.message || "Server error" });
    } finally {
      setAddressSaving(false);
    }
  }, [addressDraft]);

  /* --- change password --- */
  const handleChangePassword = useCallback(async (e) => {
    e?.preventDefault();
    setPwMessage(null);

    if (!oldPassword || !newPassword) {
      setPwMessage({ type: "error", text: "Both fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch(`${API_BASE}/members/update`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Password change failed");

      setPwMessage({ type: "success", text: "Password changed successfully." });
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setPwModalOpen(false), 900);
    } catch (err) {
      console.error("change password error:", err);
      setPwMessage({ type: "error", text: err.message || "Server error" });
    } finally {
      setPwSaving(false);
    }
  }, [oldPassword, newPassword]);

  /* --- return handler (optimistic) --- */
  const handleReturn = useCallback(async (loan) => {
    if (!loan || !loan._id) return;
    const ok = window.confirm(`Mark "${loan.book_id?.title ?? "this book"}" as returned? This will set the loan status to \"returned\".`);
    if (!ok) return;

    // optimistic update
    setLoans((prev) =>
      prev.map((l) => {
        if (String(l._id) !== String(loan._id)) return l;
        const statusArr = Array.isArray(l.status) ? [...l.status] : [l.status];
        if (!statusArr.includes("pending")) statusArr.push("pending");
        return { ...l, status: statusArr, return_date: new Date().toISOString(), approved: false };
      })
    );
    setReturningId(loan._id);

    try {
      const res = await fetch(`${API_BASE}/loans/${loan._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: ["returned"], approved: false, return_date: new Date().toISOString() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to return book");

      const updated = data.data ?? data.loan ?? data ?? { ...loan, status: ["returned"], approved: false, return_date: new Date().toISOString() };
      setLoans((prev) => prev.map((l) => (String(l._id) === String(loan._id) ? updated : l)));
    } catch (err) {
      console.error("return error:", err);
      alert(err.message || "Server error while returning book");
      // rollback
      setLoans((prev) =>
        prev.map((l) => {
          if (String(l._id) !== String(loan._id)) return l;
          const statusArr = Array.isArray(l.status) ? l.status.filter((s) => s !== "pending") : l.status;
          const copy = { ...l, status: statusArr };
          delete copy.return_date;
          return copy;
        })
      );
    } finally {
      setReturningId(null);
    }
  }, []);

  /* --- derived values --- */
  const loansCount = useMemo(() => loans.length, [loans]);

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-sm text-gray-600">Manage your account and view loans</p>
          </div>

          <div className="space-x-2">
            <button onClick={() => setPwModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Change password</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <AccountCard user={user} onEditAddress={() => setEditingAddress(true)} displayAddress={displayAddress} />

            {/* address editor (small inline area) */}
            {editingAddress && (
              <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
                <textarea value={addressDraft} onChange={(e) => setAddressDraft(e.target.value)} rows={4} className="w-full border border-gray-200 rounded p-2 text-sm mb-2" />

                {addressMessage && (
                  <div className={`mb-2 text-sm ${addressMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>{addressMessage.text}</div>
                )}

                <div className="flex gap-2">
                  <button onClick={saveAddress} disabled={addressSaving} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-60">{addressSaving ? "Saving..." : "Save"}</button>
                  <button onClick={() => { setEditingAddress(false); setAddressDraft(displayAddress || ""); setAddressMessage(null); }} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm">Cancel</button>
                </div>
              </div>
            )}

            <FinesSummary fineLoading={fineLoading} fineError={fineError} fineTotal={fineTotal} myFines={myFines} />
          </div>

          <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Your Loans & Reservations ({loansCount})</h2>
            <LoansTable loans={loans} loading={loading} error={error} returningId={returningId} onReturn={handleReturn} />
          </div>
        
        </div>
        <div className="mt-4">
  <PaymentsTable apiBase={API_BASE} />
</div>

      </div>

      <Modal open={pwModalOpen} onClose={() => setPwModalOpen(false)} title="Change password">
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full border border-gray-200 rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-200 rounded p-2" />
          </div>

          {pwMessage && (
            <div className={`text-sm ${pwMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>{pwMessage.text}</div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setPwModalOpen(false)} className="px-3 py-1 bg-white border border-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={pwSaving} className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-60">{pwSaving ? "Saving..." : "Change password"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};



export default MemberProfileContent;
