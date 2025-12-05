
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:4000/api";

const ReservationCard = ({ reservation, onApproved = () => {}, onRejected = () => {} }) => {
  const id = reservation._id ?? reservation.id;
  const book = reservation.book_id || reservation.book || {};
  const member = reservation.member_id || reservation.member || {};
  const notes = reservation.notes || "";

  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState(null);


const approve = async () => {
    setActionError(null);
    setLoadingAction(true);
    try {
      const res = await fetch(`http://localhost:4000/api/loans/${id}/approve`, {
        method: "POST",
        credentials: "include",           
        headers: { "Content-Type": "application/json" },
        
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to approve reservation");
  
      onApproved(data.data ?? data);
    } catch (err) {
      setActionError(err.message || "Server error");
    } finally {
      setLoadingAction(false);
    }
  };
  

  const reject = async () => {
    const confirm = window.confirm("Reject this reservation? This cannot be undone.");
    if (!confirm) return;
    setActionError(null);
    setLoadingAction(true);
    try {
      
      const res = await fetch(`${API_BASE}/loans/${id}/reject`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify({ reason: "Rejected by staff" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to reject reservation");
      }
      onRejected(id);
    } catch (err) {
      console.error("reject error:", err);
      setActionError(err.message || "Server error");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded p-4 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
  <div className="flex-1">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-lg font-semibold text-slate-100">
          {book.title || "Untitled book"}
        </div>
        <div className="text-sm text-slate-400">
          by {book.author || "Unknown"}
        </div>
      </div>
      <div className="text-sm text-slate-400 text-right">
        Reservation ID:{" "}
        <span className="font-mono text-xs text-slate-300">
          {String(id).slice(-6)}
        </span>
      </div>
    </div>

    <div className="mt-3 text-sm text-slate-200">
      <div>
        <strong>Member:</strong> {member.name || member.full_name || "Unknown user"}{" "}
        <span className="text-xs text-slate-400">
          ({member.email || "no-email"})
        </span>
      </div>
      {notes && (
        <div className="mt-2">
          <strong>Notes:</strong>
          <div className="mt-1 p-2 bg-slate-800 rounded text-sm text-slate-200">
            {notes}
          </div>
        </div>
      )}
    </div>
  </div>

  <div className="shrink-0 flex flex-col gap-2 items-end">
    {actionError && (
      <div className="text-sm text-rose-400">{actionError}</div>
    )}
    <div className="flex gap-2">
      <Button
        onClick={approve}
        disabled={loadingAction}
        className="min-w-24"
      >
        {loadingAction ? "Working..." : "Approve"}
      </Button>
      <Button
        variant="destructive"
        onClick={reject}
        disabled={loadingAction}
        className="min-w-24"
      >
        {loadingAction ? "Working..." : "Reject"}
      </Button>
    </div>
    <div className="text-xs text-slate-500 mt-1">
      {reservation.createdAt
        ? new Date(reservation.createdAt).toLocaleString()
        : ""}
    </div>
  </div>
</div>

  );
};

export default ReservationCard;
