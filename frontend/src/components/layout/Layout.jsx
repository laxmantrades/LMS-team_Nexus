
import React from "react";
import Header from "../Header";
import GlobalFineBanner from "@/pages/member/GlobalFineBanner";


const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-emerald-950">
      <Header />
      
      <GlobalFineBanner />

      <main className="mx-auto max-w-7xl sm:px-4 sm:py-6 text-slate-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;
