// src/components/layout/Header.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuthUser,
  selectAuthStatus,
  logoutUser, // ✅ async thunk for API logout
} from "@/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const Header = () => {
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // ✅ call thunk (logs out on backend + clears Redux state)
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/"); // redirect home after logout
    } catch (err) {
      console.error("Logout error:", err);
      // You can add a toast here if you use something like react-hot-toast
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-bold text-white">
          MyLibrary
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            // ✅ Logged-in dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                  disabled={status === "loading"}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.name || user?.full_name || user?.email || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="bg-black/90 text-white border-white/20 w-48"
              >
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      user.role === "member"
                        ? "/member/dashboard"
                        : "/staff/dashboard"
                    )
                  }
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-500 cursor-pointer"
                  disabled={status === "loading"}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {status === "loading" ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // ✅ Logged-out state
            <>
              <Button
                asChild
                variant={isActive("/member/login") ? "default" : "outline"}
                className={
                  isActive("/member/login")
                    ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-none"
                    : "border-white/30 text-white hover:bg-white/10"
                }
              >
                <Link to="/member/login">Login</Link>
              </Button>

              <Button
                asChild
                variant={isActive("/member/signup") ? "default" : "outline"}
                className={
                  isActive("/member/signup")
                    ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-none"
                    : "border-white/30 text-white hover:bg-white/10"
                }
              >
                <Link to="/member/signup">Sign Up</Link>
              </Button>

              <Button
                asChild
                variant={isActive("/staff/login") ? "default" : "outline"}
                className={
                  isActive("/staff/login")
                    ? "bg-gradient-to-r from-purple-500 to-red-500 text-white border-none"
                    : "border-white/30 text-white hover:bg-white/10"
                }
              >
                <Link to="/staff/login">Admin Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
