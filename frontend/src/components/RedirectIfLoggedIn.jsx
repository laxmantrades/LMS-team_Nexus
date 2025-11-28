import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectAuthUser } from "@/features/auth/authSlice";

/**
 * Prevent logged-in users from accessing login/signup pages.
 */
const RedirectIfLoggedIn = ({ children }) => {
  const user = useSelector(selectAuthUser);

  if (user) {
    // Redirect based on role
    if (user.role === "member") return <Navigate to="/member/dashboard" replace />;
    if (user.role === "staff") return <Navigate to="/staff/dashboard" replace />;
  }

  return children; // not logged in → allow page
};

export default RedirectIfLoggedIn;
