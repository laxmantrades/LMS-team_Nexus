// src/components/layout/Header.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAuthUser, logout } from "@/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from "lucide-react";

const Header = () => {
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
       
        <Link
          to="/"
          className="text-2xl font-bold  "
        >
          MyLibrary
        </Link>

        
        <div className="flex items-center gap-3">
          {user ? (
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.name || user?.email || "User"}
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
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            
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

              {/* Admin / Staff Login */}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
