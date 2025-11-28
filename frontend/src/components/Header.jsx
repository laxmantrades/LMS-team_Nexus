// src/components/layout/Header.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuthUser,
  selectAuthStatus,
  logoutUser,
} from "@/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Menu as MenuIcon, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";

const Header = () => {
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/");
      setMobileOpen(false);
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  const toggleMobile = () => setMobileOpen((s) => !s);

  const isActive = (path) => location.pathname === path;

  const isStaff = user?.role === "staff" || user?.role === "admin"; // adjust if needed

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-purple-900/70 via-black/60 to-indigo-900/70 backdrop-blur-2xl shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="sr-only">Home</span>
          MyLibrary
        </Link>

      {/* Desktop controls */}
<div className="hidden md:flex items-center gap-3">
  {/* Not logged in → show buttons */}
  {!user && (
    <>
      <Button
        asChild
        variant={isActive("/member/login") ? "default" : "outline"}
        className={
          isActive("/member/login")
            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-none"
            : "border-white/30 text-black hover:bg-white/10"
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
            : "border-white/30 text-black hover:bg-white/10"
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
            : "border-white/30 text-black hover:bg-white/10"
        }
      >
        <Link to="/staff/login">Admin Login</Link>
      </Button>
    </>
  )}

  {/* Logged-in MEMBER → show dropdown */}
  {user && user.role === "member" && (
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
          onClick={() => navigate("/member/dashboard")}
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
  )}

  {/* Logged-in STAFF → show nothing (sidebar handles navigation) */}
  {user && (user.role === "staff" || user.role === "admin") && null}
</div>


        {/* Mobile hamburger — HIDE FOR STAFF */}
        {!isStaff && (
          <div className="md:hidden">
            <button
              onClick={toggleMobile}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>

      {/* MOBILE PANEL — HIDE FOR STAFF */}
      {!isStaff && (
        <div
          className={`md:hidden transition-max-h duration-200 ease-in-out overflow-hidden ${
            mobileOpen ? "max-h-[400px]" : "max-h-0"
          }`}
        >
          <nav className="px-4 pb-4">
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/member/dashboard");
                      setMobileOpen(false);
                    }}
                    className="w-full text-left rounded px-3 py-2 text-white hover:bg-white/5"
                  >
                    <LayoutDashboard className="h-4 w-4 inline-block mr-2" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMobileOpen(false);
                    }}
                    className="w-full text-left rounded px-3 py-2 text-white hover:bg-white/5"
                  >
                    <User className="h-4 w-4 inline-block mr-2" />
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left rounded px-3 py-2 text-red-300 hover:bg-red-900/10"
                  >
                    <LogOut className="h-4 w-4 inline-block mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/member/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded px-3 py-2 text-white hover:bg-white/5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/member/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded px-3 py-2 text-white hover:bg-white/5"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/staff/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded px-3 py-2 text-white hover:bg-white/5"
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
