// src/pages/auth/AuthLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ title, subtitle, highlight, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-900 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-pink-500/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {title}{' '}
            {highlight && (
              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                {highlight}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
          )}
        </div>

        {children}

        <div className="mt-4 flex justify-between text-xs text-gray-300">
          <span>© {new Date().getFullYear()} YourCompany</span>
          <div className="space-x-4">
            <Link to="#" className="hover:text-white">
              Privacy
            </Link>
            <Link to="#" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
