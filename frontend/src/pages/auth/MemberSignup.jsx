// src/pages/auth/MemberSignup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AuthLayout from './AuthLayout';

import {
  memberSignup,
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

const MemberSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectAuthUser);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address:"",
  });

  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && user?.role === 'member') {
      navigate('/member/dashboard');
    }
  }, [status, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setLocalError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    dispatch(
      memberSignup({
        name: form.name,
        email: form.email,
        password: form.password,
        address:form.address
      })
    );
  };

  const combinedError = localError || error;

  return (
    <AuthLayout
      title="Join us as a"
      highlight="Member"
      subtitle="Create your account in a few seconds."
    >
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-100">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-100">
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
                className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-100">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-100">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-100">
                Address
              </Label>
              <Input
                id="Address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="Your address"
                autoComplete="your-address"
                className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
              />
            </div>

            {combinedError && (
              <Alert className="border-red-500/60 bg-red-500/10 text-red-100">
                <AlertDescription className="text-xs">
                  {combinedError}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-300">
              <label className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  required
                  className="mt-[2px] border-white/40 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    className="underline hover:text-white"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="underline hover:text-white"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/40 hover:brightness-110"
            >
              {status === 'loading'
                ? 'Creating account...'
                : 'Create Member Account'}
            </Button>

            <p className="text-xs text-center text-gray-300">
              Already have a member account?{' '}
              <Link
                to="/member/login"
                className="text-indigo-300 hover:text-indigo-100 font-medium"
              >
                Log in
              </Link>
            </p>

            <p className="text-[11px] text-center text-gray-400">
              Staff users cannot sign up here.{' '}
              <Link
                to="/staff/login"
                className="underline underline-offset-2 hover:text-white"
              >
                Staff login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default MemberSignup;
