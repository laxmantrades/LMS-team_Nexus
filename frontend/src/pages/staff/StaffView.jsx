import React from "react";
import StaffDashboard from "./StaffDashboard";

const StaffView = () => {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 py-6 px-4 sm:py-8 sm:px-6 md:px-8">
  <div className="max-w-3xl md:max-w-6xl mx-auto">
    <header className="mb-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-100">
        Staff Dashboard
      </h1>
      <p className="text-sm sm:text-base text-slate-400 mt-1">
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
