// src/layouts/StaffLayout.jsx
import SidebarStaff from "@/pages/staff/components/SidebarStaff";
import React from "react";
import { Outlet } from "react-router-dom";


export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950">
  <div className="md:flex gap-6 px-4 py-4">
    <SidebarStaff />
    <main className="flex-1">
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg shadow-xl">
        <Outlet />
      </div>
    </main>
  </div>
</div>

  );
}
