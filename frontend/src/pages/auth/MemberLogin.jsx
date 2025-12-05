//MemberLoginPage
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "./AuthLayout";
import {
  memberLogin,
  resetAuthState,
  selectAuthStatus,
  selectAuthError,
  selectAuthUser,
} from "../../features/auth/authSlice";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MemberLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectAuthUser);

  const [form, setForm] = useState({
    email: "pushpa@gmail.com",
    password: "password1234",
  });

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded" && user?.role === "member") {
      navigate("/member/dashboard");
    }
  }, [status, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(memberLogin(form));
  };

  return (
    <AuthLayout
    title="Welcome back,"
    highlight="Member"
    subtitle="Log in to access your personalized dashboard."
  >
    <Card className="border-slate-200 bg-white/95 shadow-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-800">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className="border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            />
          </div>
  
          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-800">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            />
          </div>
  
          {/* Error */}
          {error && (
            <Alert className="border-rose-300 bg-rose-50 text-rose-700">
              <AlertDescription className="text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}
  
          {/* Remember / Forgot */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <Checkbox id="remember" className="border-slate-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-indigo-600 hover:text-fuchsia-600 underline underline-offset-2"
            >
              Forgot password?
            </button>
          </div>
  
          {/* Submit */}
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md hover:brightness-110"
          >
            {status === "loading" ? "Logging in..." : "Log in as Member"}
          </Button>
  
          {/* Sign up link */}
          <p className="text-sm text-center text-slate-600">
            New here?{" "}
            <Link
              to="/member/signup"
              className="text-indigo-600 hover:text-fuchsia-600 font-medium"
            >
              Create a member account
            </Link>
          </p>
  
          {/* Staff link */}
          <p className="text-xs text-center text-slate-500">
            Staff member?{" "}
            <Link
              to="/staff/login"
              className="underline underline-offset-2 text-slate-700 hover:text-slate-900"
            >
              Go to staff login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  </AuthLayout>
  
  );
};

export default MemberLogin;
