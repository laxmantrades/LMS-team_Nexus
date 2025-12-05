import React, { useState } from "react";
import { useSelector } from "react-redux";
import PendingReservations from "./components/PendingReservations";
import PendingReturns from "./components/PendingReturns";
import ApprovedReservations from "./components/ApprovedReservations";
import ApprovedReturns from "./components/ApprovedReturns";
import ActiveBorrowed from "./components/ActiveBorrowed";
import OverdueLoans from "./components/OverdueLoans";
import RecentPayments from "./components/RecentPayments";

import { AddStaffModal } from "./components/AddStaffModal";
import { selectAuthUser } from "../../features/auth/authSlice";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:4000/api";

export default function StaffDashboard() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [sweepLoading, setSweepLoading] = useState(false);
  const user = useSelector(selectAuthUser);


  const isAdmin = (() => {
    if (!user) return false;
    const role = user.role;
    if (!role) return false;
    if (Array.isArray(role)) return role.includes("admin");
    return role === "admin";
  })();

  function handleCreated(newStaff) {
    console.log("Created staff", newStaff);
  }

  
  const handleSweepFines = async () => {
    if (!window.confirm("Are you sure you want to sweep / generate fines for overdue loans?")) return;

    setSweepLoading(true);

    try {
      const res = await fetch(`${API_BASE}/fines/sweep`, {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to sweep fines");
      }

      alert(json.message || "Fines swept successfully ✅");

    } catch (err) {
      console.error("Sweep fines error:", err);
      alert(err.message || "Server error while sweeping fines");
    } finally {
      setSweepLoading(false);
    }
  };

  return (
    <div className="md:flex gap-6">
      {/* MAIN CONTENT */}
      <section className="flex-1">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold mb-2 text-indigo-100">
                Staff Dashboard
              </h2>

            
              <Button
                onClick={handleSweepFines}
                disabled={sweepLoading}
                className="bg-blue-600 hover:bg-blue-500 cursor-pointer disabled:opacity-60"
              >
                {sweepLoading ? "Sweeping..." : "Sweep Fines"}
              </Button>
            </div>

            {/* ADMIN ACTION */}
            <div>
              {isAdmin && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 shadow"
                >
                  ➕ Add Staff
                </button>
              )}
            </div>

          </div>

          <div className="space-y-6">
            <PendingReservations />
            <PendingReturns />
            <ActiveBorrowed />
            <OverdueLoans />
            <ApprovedReservations />
            <ApprovedReturns />
            <RecentPayments />
          </div>
        </div>
      </section>

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
