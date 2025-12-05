
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AuthLayout from './AuthLayout';

import {
  staffLogin,
  resetAuthState,
  selectAuthStatus,
  selectAuthError,
  selectAuthUser,
} from '../../features/auth/authSlice';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StaffLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectAuthUser);

  const [form, setForm] = useState({
    email: 'bibek@gmail.com',
    password: 'password123',
  });

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && (user?.role === 'staff' || user?.role === 'admin')) {
      navigate('/staff/dashboard');
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
    dispatch(staffLogin(form));
    navigate('/staff/dashboard');
  };

  return (
    <AuthLayout
      title="Staff"
      highlight="Portal"
      subtitle="Authorized personnel only. Your access is monitored."
    >
      <Card className="border-white/10 bg-white backdrop-blur-xl shadow-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-email" className="text-black">
                Staff email
              </Label>
              <Input
                id="staff-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="staff@company.com"
                autoComplete="email"
                className="bg-transparent border-white/20 text-black placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-password" className="text-black">
                Password
              </Label>
              <Input
                id="staff-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-transparent border-white/20 text-black placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>

            {error && (
              <Alert className="border-red-500/60 bg-red-500/10 text-red-100">
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between text-xs text-black">
              <label className="flex items-center gap-2">
                <Checkbox
                  id="staff-remember"
                  className="border-white/40 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                <span>Remember this device</span>
              </label>
              <button
                type="button"
                className="hover:text-black underline underline-offset-2"
              >
                Need help?
              </button>
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/40 hover:brightness-110"
            >
              {status === 'loading' ? 'Logging in...' : 'Log in as Staff'}
            </Button>

            <p className="text-[11px] text-center text-black">
              Member user?{' '}
              <Link
                to="/member/login"
                className="underline underline-offset-2 hover:text-black"
              >
                Go to member login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default StaffLogin;
