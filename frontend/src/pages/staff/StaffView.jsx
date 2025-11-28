import React from "react";
import StaffDashboard from "./StaffDashboard";

const StaffView = () => {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-6 px-4 sm:py-8 sm:px-6 md:px-8">
      <div className="max-w-3xl md:max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Staff Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage reservations, approve or reject pending loans.
          </p>
        </header>

        <div className="w-full">
          <StaffDashboard />
        </div>
      </div>
    </main>
  );
};

export default StaffView;
