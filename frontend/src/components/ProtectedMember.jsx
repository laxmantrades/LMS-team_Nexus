// src/components/ProtectedMember.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuthUser } from "@/features/auth/authSlice";

/**
 * Protects routes for logged-in MEMBERS only.
 * If not logged in -> redirect to /member/login
 * If logged in but role !== "member" -> redirect to staff dashboard or appropriate place
 */
const ProtectedMember = ({ children }) => {
  const user = useSelector(selectAuthUser);
  const location = useLocation();

  if (!user) {
    // not logged in
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  if (user.role !== "member") {
    // logged in but wrong role -> send to staff dashboard (or to member login)
    return <Navigate to="/staff/dashboard" replace />;
  }

  // authorized
  return children;
};

export default ProtectedMember;
