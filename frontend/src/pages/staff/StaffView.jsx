
import React from "react";
import StaffDashboard from "./components/StaffDashboard";

const StaffView = () => {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-gray-600">Manage reservations, approve or reject pending loans.</p>
        </header>

        <StaffDashboard />
      </div>
    </main>
  );
};

export default StaffView;
