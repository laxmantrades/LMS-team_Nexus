// src/layouts/StaffLayout.jsx
import SidebarStaff from "@/pages/staff/components/SidebarStaff";
import React from "react";
import { Outlet } from "react-router-dom";


export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-slate-50 ">
      <div className="md:flex gap-6">
        <SidebarStaff />
        <main className="flex-1">
          <div className="bg-white rounded-lg shadow ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
