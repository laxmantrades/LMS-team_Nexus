
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

  const isStaff = user?.role === "staff" || user?.role === "admin"; 

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-500/30 bg-linear-to-br from-indigo-950/90 via-slate-900/90 to-fuchsia-900/90 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      
      <Link
        to="/"
        className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight"
      >
        <span className="sr-only">Home</span>
        <span className="bg-linear-to-br from-indigo-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]">
          MyLibrary
        </span>
      </Link>
  
    
      <div className="hidden md:flex items-center gap-3">
        
        {!user && (
          <>
            <Button
              asChild
              variant={isActive("/member/login") ? "default" : "outline"}
              className={
                isActive("/member/login")
                  ? "bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white border-none shadow-lg shadow-indigo-500/40"
                  : "border-white/40 text-black hover:bg-white/10 hover:border-white/60"
              }
            >
              <Link to="/member/login">Login</Link>
            </Button>
  
            <Button
              asChild
              variant={isActive("/member/signup") ? "default" : "outline"}
              className={
                isActive("/member/signup")
                  ? "bg-linear-to-br from-emerald-500 to-teal-400 text-slate-950 border-none shadow-lg shadow-emerald-500/40"
                  : "border-white/40 text-black hover:bg-white/10 hover:border-white/60"
              }
            >
              <Link to="/member/signup">Sign Up</Link>
            </Button>
  
            <Button
              asChild
              variant={isActive("/staff/login") ? "default" : "outline"}
              className={
                isActive("/staff/login")
                  ? "bg-linear-to-br from-amber-500 to-rose-500 text-slate-950 border-none shadow-lg shadow-amber-500/40"
                  : "border-white/40 text-black hover:bg-white/10 hover:border-white/60"
              }
            >
              <Link to="/staff/login">Admin Login</Link>
            </Button>
          </>
        )}
  
       
        {user && user.role === "member" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-slate-100 hover:bg-white/10 flex items-center gap-2 hover:text-white"
                disabled={status === "loading"}
              >
                <User className="h-4 w-4 text-indigo-300" />
                <span className="hidden sm:inline">
                  {user?.name || user?.full_name || user?.email || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
  
            <DropdownMenuContent
              align="end"
              className="bg-slate-950/95 text-slate-100 border border-slate-700/80 w-48 shadow-xl shadow-black/60"
            >
              <DropdownMenuItem
                onClick={() => navigate("/member/dashboard")}
                className="cursor-pointer hover:bg-slate-800/80 focus:bg-slate-800/80"
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-300" />
                Dashboard
              </DropdownMenuItem>
  
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer hover:bg-slate-800/80 focus:bg-slate-800/80"
              >
                <User className="mr-2 h-4 w-4 text-indigo-300" />
                Profile
              </DropdownMenuItem>
  
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-rose-300 focus:text-rose-400 hover:bg-rose-900/40 cursor-pointer"
                disabled={status === "loading"}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {status === "loading" ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
  
       
        {user && (user.role === "staff" || user.role === "admin") && null}
      </div>
  
      
      {!isStaff && (
        <div className="md:hidden">
          <button
            onClick={toggleMobile}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-slate-900"
          >
            {mobileOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  
    
    {!isStaff && (
      <div
        className={`md:hidden transition-max-h duration-200 ease-in-out overflow-hidden ${
          mobileOpen ? "max-h-[400px]" : "max-h-0"
        }`}
      >
        <nav className="px-4 pb-4 bg-linear-to-br from-slate-950/95 via-slate-900/95 to-indigo-950/95 border-t border-slate-800/80">
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/member/dashboard");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left rounded px-3 py-2 text-slate-100 hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4 inline-block mr-2 text-indigo-300" />
                  Dashboard
                </button>
  
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left rounded px-3 py-2 text-slate-100 hover:bg-white/10"
                >
                  <User className="h-4 w-4 inline-block mr-2 text-indigo-300" />
                  Profile
                </button>
  
                <button
                  onClick={handleLogout}
                  className="w-full text-left rounded px-3 py-2 text-rose-300 hover:bg-rose-900/30"
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
                  className="block rounded px-3 py-2 text-slate-100 hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/member/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded px-3 py-2 text-slate-700 hover:bg-white/10"
                >
                  Sign Up
                </Link>
                <Link
                  to="/staff/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded px-3 py-2 text-slate-100 hover:bg-white/10"
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
