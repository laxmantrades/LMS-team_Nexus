// src/pages/Profile.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";

const Profile = () => {
  const user = useSelector(selectAuthUser);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1>Please log in to view your profile</h1>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="p-6 bg-white/10 rounded-xl border border-white/10">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    </div>
  );
};

export default Profile;
