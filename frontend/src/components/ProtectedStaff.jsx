// src/components/ProtectedStaff.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuthUser } from "@/features/auth/authSlice";


const ProtectedStaff = ({ children }) => {
  const user = useSelector(selectAuthUser);
  
  
  const location = useLocation();

  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // adjust this check if your staff roles are "admin" or similar
  if (user.role !== "staff" && user.role !== "admin") {
    return <Navigate to="/member/dashboard" replace />;
  }

  return children;
};

export default ProtectedStaff;
