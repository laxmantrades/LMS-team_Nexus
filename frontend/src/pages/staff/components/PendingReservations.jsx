// src/pages/staff/components/PendingReservations.jsx
import React, { useEffect, useState, useCallback } from "react";
import ReservationCard from "./ReservationCard";

const API_BASE = "http://localhost:4000/api"; // adjust as needed

const PendingReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Adjust endpoint if your backend uses a different query param
      const res = await fetch(`${API_BASE}/loans?status=reserved&pending=true`, {
        credentials: "include", // cookie auth
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load reservations");
      }
      // Expecting data.data or plain array
      setReservations(data.data ?? data);
    } catch (err) {
      console.error("fetchPending error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    // you can poll every X seconds if you want live updates:
    // const interval = setInterval(fetchPending, 30000);
    // return () => clearInterval(interval);
  }, [fetchPending]);

  const removeReservationFromList = (id) => {
    setReservations((prev) => prev.filter((r) => String(r._id || r.id) !== String(id)));
  };

  if (loading) return <div className="p-4">Loading pending reservations...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!reservations || reservations.length === 0)
    return <div className="p-4 text-gray-600">No pending reservations.</div>;

  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation._id || reservation.id}
          reservation={reservation}
          onApproved={(updated) => removeReservationFromList(updated._id ?? updated.id)}
          onRejected={(id) => removeReservationFromList(id)}
        />
      ))}
    </div>
  );
};

export default PendingReservations;
