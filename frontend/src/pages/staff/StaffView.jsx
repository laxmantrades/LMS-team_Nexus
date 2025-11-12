// src/pages/staff/StaffView.jsx
import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Placeholder Staff view. Fill this in later with
 * book management, stats, and admin actions.
 */
const StaffView = () => {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-2">Staff Dashboard (Coming Soon)</h1>
        <p className="text-gray-600 mb-6">
          This view will contain staff tools: manage books, users, reservations and analytics.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button asChild variant="outline">
            <a href="/staff/dashboard">Open placeholder dashboard</a>
          </Button>
          <Button disabled>Import / Export (TBD)</Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <strong>Note:</strong> Implementation for staff features will be added later.
        </div>
      </div>
    </main>
  );
};

export default StaffView;
