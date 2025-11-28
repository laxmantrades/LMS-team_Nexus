import React, { useState } from "react";
import { useSelector } from "react-redux";
import PendingReservations from "./components/PendingReservations";
import PendingReturns from "./components/PendingReturns";
import ApprovedReservations from "./components/ApprovedReservations";
import ApprovedReturns from "./components/ApprovedReturns";
import ActiveBorrowed from "./components/ActiveBorrowed";
import OverdueLoans from "./components/OverdueLoans";
import { Link } from "react-router-dom";
import { AddStaffModal } from "./components/AddStaffModal";
import { selectAuthUser } from "../../features/auth/authSlice"; // adjust path as needed

const links = [
  { label: "Dashboard", to: "/staff/dashboard", icon: "📊" },
  { label: "Manage Payments", to: "/staff/payments", icon: "💵" },
  { label: "Add Book", to: "/admin/addBook", icon: "📚" },
  { label: "Reports & Analytics", to: "/staff/reports", icon: "📈" },
];

export default function StaffDashboard() {
  const [isModalOpen, setModalOpen] = useState(false);
  const user = useSelector(selectAuthUser);

  // Determine admin status from Redux user. Supports string or array role.
  const isAdmin = (() => {
    if (!user) return false;
    const role = user.role;
    if (!role) return false;
    if (Array.isArray(role)) return role.includes("admin");
    return role === "admin";
  })();

  function handleCreated(newStaff) {
    console.log("Created staff", newStaff);
    // TODO: dispatch a refresh action or show a toast
  }

  return (
    <div className="md:flex gap-6">
     

      {/* MAIN CONTENT */}
      <section className="flex-1">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Staff Dashboard</h2>
              <p className="text-sm text-gray-500 mb-4">
                Manage reservations, returns, loans, and more.
              </p>
            </div>

            {/* Mobile / top Add Staff button for smaller screens */}
            <div className="">
              {isAdmin && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="rounded-md bg-green-600 text-white px-3 py-2"
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
