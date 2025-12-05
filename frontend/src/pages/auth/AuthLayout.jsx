
import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ title, subtitle, highlight, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center  text-slate-100">
  
 
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
    <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full blur-3xl" />
  </div>

  <div className="relative z-10 w-full max-w-md mx-4">
    <div className="mb-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        {title}{" "}
        {highlight && (
          <span className="bg-linear-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h1>

      {subtitle && (
        <p className="mt-2 text-sm text-slate-400">
          {subtitle}
        </p>
      )}
    </div>

 
    {children}

    
    <div className="mt-6 flex justify-between text-xs text-slate-500">
      <span>© {new Date().getFullYear()} MyLibrary</span>
      <div className="space-x-4">
        <Link
          to="#"
          className="hover:text-fuchsia-400 transition-colors duration-150"
        >
          Privacy
        </Link>
        <Link
          to="#"
          className="hover:text-fuchsia-400 transition-colors duration-150"
        >
          Terms
        </Link>
      </div>
    </div>
  </div>
</div>

  );
};

export default AuthLayout;
