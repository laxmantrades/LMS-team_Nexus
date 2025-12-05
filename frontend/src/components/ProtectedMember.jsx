
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuthUser } from "@/features/auth/authSlice";


const ProtectedMember = ({ children }) => {
  const user = useSelector(selectAuthUser);
  const location = useLocation();

  if (!user) {
    // not logged in
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  if (user.role !== "member") {
    // logged in but wrong role send to staff dashboard 
    return <Navigate to="/staff/dashboard" replace />;
  }

  // authorized
  return children;
};

export default ProtectedMember;
