
import React from "react";
import PendingReservations from "./PendingReservations";

const StaffDashboard = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Pending Reservations</h2>
          <p className="text-sm text-gray-500 mb-4">
            These reservations were created by members and await staff approval.
          </p>

          <PendingReservations />
        </div>
      </div>

      <aside className="hidden md:block">
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h3 className="font-medium">Quick Links</h3>
          <ul className="text-sm text-gray-600">
            <li>- Manage Books</li>
            <li>- Manage Users</li>
            <li>- Reports & Analytics</li>
          </ul>
        </div>
      </aside>
    </section>
  );
};

export default StaffDashboard;
