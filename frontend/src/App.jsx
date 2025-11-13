
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "@/components/layout/Header";

import MemberLogin from "./pages/auth/MemberLogin";
import MemberSignup from "./pages/auth/MemberSignup";
import StaffLogin from "./pages/auth/StaffLogin";
import Profile from "./pages/Profile";


import MemberView from "./pages/member/MemberView";
import StaffView from "./pages/staff/StaffView";
import BookDetail from "./pages/member/BookDetail";

const App = () => {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Navigate to="/member/login" replace />} />

        <Route path="/member/login" element={<MemberLogin />} />
        <Route path="/member/signup" element={<MemberSignup />} />

        {/* Member main view  */}
        <Route path="/member/dashboard" element={<MemberView />} />
        <Route path="/books/:id" element={<BookDetail />} />
          {/* Staff view  */}
        <Route path="/staff/login" element={<StaffLogin />} />
       
        <Route path="/staff/dashboard" element={<StaffView />} />

        <Route path="/profile" element={<Profile />} />

        
        <Route path="*" element={<Navigate to="/member/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
