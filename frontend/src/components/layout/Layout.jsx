// src/components/layout/Layout.jsx
import React from "react";
import Header from "../Header";
import GlobalFineBanner from "@/pages/member/GlobalFineBanner";



/**
 * Layout component
 * - Keeps Header separated from page-level banners like GlobalFineBanner
 * - Renders children inside a main container
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Banner sits below header, not inside the header itself */}
      <GlobalFineBanner />

      <main className="mx-auto max-w-7xl sm:px-4 sm:py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
