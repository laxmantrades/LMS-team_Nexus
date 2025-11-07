import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "@/components/layout/Header";

import MemberLogin from "./pages/auth/MemberLogin";
import MemberSignup from "./pages/auth/MemberSignup";
import StaffLogin from "./pages/auth/StaffLogin";
import Profile from "./pages/Profile";

const MemberDashboard = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <h1 className="text-3xl font-bold">Member Dashboard</h1>
  </div>
);

const StaffDashboard = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <h1 className="text-3xl font-bold">Admin/Staff Dashboard</h1>
  </div>
);

const App = () => {
  return (
    <>
      {/* 👇 Header is always shown on all pages */}
      <Header />

      <Routes>
        {/* Member routes */}
        <Route path="/" element={<Navigate to="/member/login" replace />} />
        <Route path="/member/login" element={<MemberLogin />} />
        <Route path="/member/signup" element={<MemberSignup />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />

        {/* Admin / Staff routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/member/login" replace />} />

        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
};

export default App;
