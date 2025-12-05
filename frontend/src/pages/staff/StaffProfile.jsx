
import { selectAuthUser, setUser } from "@/features/auth/authSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";


const API_BASE = "http://localhost:4000/api";


const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-slate-900/90 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md p-6 z-10 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-indigo-100">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
  
  );
};

const StaffProfile = () => {
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();

  // Address state
  const [editingAddress, setEditingAddress] = useState(false);
  const [address, setAddress] = useState(user?.address || "");
  const [addressDraft, setAddressDraft] = useState(user?.address || "");
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState(null);

  // Password modal state
  const [pwModal, setPwModal] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // keep address in sync if user prop changes
  useEffect(() => {
    setAddress(user?.address || "");
    setAddressDraft(user?.address || "");
  }, [user]);

  // Helper to extract updated user returned from backend
  const extractUpdated = (data) => {
    return data?.data || data?.staff || data?.member || data || null;
  };

  // Save address: PATCH /api/staff/me
  const saveAddress = async () => {
    setAddressMsg(null);
    setAddressSaving(true);

    try {
      const res = await fetch(`${API_BASE}/staff/update`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressDraft }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update address");

      const updated = extractUpdated(data);
      // if server returned updated staff, update redux and local UI
      if (updated) {
        dispatch(setUser(updated));
        setAddress(updated.address || addressDraft);
        setAddressDraft(updated.address || addressDraft);
      } else {
        // fallback if server didn't return user object
        setAddress(addressDraft);
      }

      setEditingAddress(false);
      setAddressMsg({ type: "success", text: "Address updated." });
    } catch (err) {
      setAddressMsg({ type: "error", text: err.message || "Server error" });
    } finally {
      setAddressSaving(false);
    }
  };

  // Change password: PATCH /api/staff/me with oldPassword + newPassword
  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (!oldPw || !newPw) {
      setPwMsg({ type: "error", text: "Both fields are required." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch(`${API_BASE}/staff/update`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Password change failed");

      const updated = extractUpdated(data);
      if (updated) dispatch(setUser(updated)); // update redux if server returned user

      setPwMsg({ type: "success", text: "Password updated successfully." });
      setOldPw("");
      setNewPw("");
      setTimeout(() => setPwModal(false), 900);
    } catch (err) {
      setPwMsg({ type: "error", text: err.message || "Server error" });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 py-12 px-4">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-indigo-100">Staff Profile</h1>
        <p className="text-sm text-slate-400">Manage your staff account</p>
      </div>

      <button
        onClick={() => setPwModal(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Change password
      </button>
    </div>

    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-indigo-100">
        Account Information
      </h2>

      <p className="text-sm text-slate-200 mb-1">
        <strong>Name:</strong> {user?.full_name || user?.email}
      </p>

      <p className="text-sm text-slate-200 mb-1">
        <strong>Email:</strong> {user?.email}
      </p>

      <p className="text-sm text-slate-200 mb-4">
        <strong>Role:</strong> {user?.role}
      </p>

      {/* Address block */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-200 mb-2">Address</h3>

        {!editingAddress ? (
          <>
            <p className="text-sm text-slate-400 mb-3">
              {address || "No address set."}
            </p>
            <button
              onClick={() => {
                setEditingAddress(true);
                setAddressDraft(address);
                setAddressMsg(null);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100 hover:bg-slate-700"
            >
              Edit Address
            </button>
          </>
        ) : (
          <>
            <textarea
              rows={3}
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              className="w-full border border-slate-700 bg-slate-900 text-slate-100 rounded p-2 text-sm mb-2 placeholder:text-slate-500"
            />

            {addressMsg && (
              <p
                className={`text-sm mb-2 ${
                  addressMsg.type === "error"
                    ? "text-rose-400"
                    : "text-emerald-400"
                }`}
              >
                {addressMsg.text}
              </p>
            )}

            <div className="flex gap-2">
              <button
                disabled={addressSaving}
                onClick={saveAddress}
                className="px-3 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-60 hover:bg-indigo-500"
              >
                {addressSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditingAddress(false);
                  setAddressDraft(address);
                  setAddressMsg(null);
                }}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-10 border-t border-slate-800 pt-6">
        <h3 className="text-sm font-medium text-slate-200 mb-2">
          Staff Tools
        </h3>
        <div className="flex gap-3 mt-2">
          <Link to="/staff/dashboard"><button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
            Open Dashboard
          </button></Link>
          
        </div>
      </div>
    </div>
  </div>

  {/* Password modal */}
  <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password">
    <form onSubmit={changePassword} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Current Password
        </label>
        <input
          type="password"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          className="w-full border border-slate-700 bg-slate-900 text-slate-100 rounded p-2 placeholder:text-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="w-full border border-slate-700 bg-slate-900 text-slate-100 rounded p-2 placeholder:text-slate-500"
        />
      </div>

      {pwMsg && (
        <div
          className={`text-sm ${
            pwMsg.type === "error"
              ? "text-rose-400"
              : "text-emerald-400"
          }`}
        >
          {pwMsg.text}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => setPwModal(false)}
          className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pwSaving}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-60 hover:bg-indigo-500"
        >
          {pwSaving ? "Saving..." : "Change Password"}
        </button>
      </div>
    </form>
  </Modal>
</div>

  );
};

export default StaffProfile;
