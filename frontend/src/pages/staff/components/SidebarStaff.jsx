// src/components/SidebarStaff.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/features/auth/authSlice";
import toast from "react-hot-toast";

/* ---------- Icons ---------- */
const Icon = {
  dashboard: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
    </svg>
  ),
  payments: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 7h20v10H2zM6 3h12v4H6z" />
    </svg>
  ),
  addBook: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  books: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  reports: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 13v-6M12 13V7M17 13v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  profile: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 17l5-5-5-5v3H9v4h7v3zM4 4h8v2H6v12h6v2H4z" />
    </svg>
  ),
};

/* ---------- Nav items ---------- */
const NAV = [
  { to: "/staff/dashboard", label: "Dashboard", icon: Icon.dashboard },
  { to: "/staff/payments", label: "Payments", icon: Icon.payments },
  { to: "/staff/books", label: "Books", icon: Icon.books },
  { to: "/staff/books/create", label: "Add Book", icon: Icon.addBook },
  { to: "/staff/reports", label: "Reports", icon: Icon.reports },
  { to: "/staff/profile", label: "Profile", icon: Icon.profile },
];

/* ---------- Helper: isActive (handles nested routes) ---------- */
function isActivePath(pathname, to) {
  if (!to) return false;
  if (pathname === to) return true;
  return pathname.startsWith(to.endsWith("/") ? to : to + "/");
}

/* ---------- Component ---------- */
export default function SidebarStaff() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("staffSidebarCollapsed") === "1";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("staffSidebarCollapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile top bar: hamburger moved to left */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {/* hamburger on left */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
            </svg>
          </button>

          {/* title next to hamburger */}
          <div className="text-lg font-semibold">Staff</div>
        </div>

        {/* collapse toggle on right */}
        <div>
          <button
            onClick={() => setCollapsed((s) => !s)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg className={`w-5 h-5 text-slate-700 transition-transform ${collapsed ? "rotate-180" : ""}`} viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M12 5l8 8-8 8-1.4-1.4L17.2 13 10.6 6.4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop / md+ sidebar (icon rail when collapsed) */}
      <aside
        className={`hidden md:flex flex-col sticky top-6 h-[calc(100dvh-4.5rem)] bg-white rounded-lg shadow p-2 transition-all duration-200
          ${collapsed ? "w-16" : "w-64"}`}
        aria-label="Staff sidebar"
      >
        {/* header (logo + optional title). Title hidden when collapsed to avoid empty space */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="text-indigo-600 bg-indigo-50 rounded-full w-9 h-9 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2L2 7v6c0 5 3 9 10 9s10-4 10-9V7l-10-5z" />
              </svg>
            </div>

            {/* label — removed from layout when collapsed */}
            {!collapsed && (
              <div className="ml-2">
                <span className="text-lg font-semibold text-slate-800">Staff Panel</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg className={`w-5 h-5 text-slate-600 transition-transform ${collapsed ? "rotate-180" : ""}`} viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M12 5l8 8-8 8-1.4-1.4L17.2 13 10.6 6.4z" />
            </svg>
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-auto">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = isActivePath(pathname, item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors duration-150
                      ${active ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"}
                      ${collapsed ? "justify-center" : "justify-start"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={`${active ? "text-white" : "text-slate-500"}`}>
                      <item.icon />
                    </span>

                    {/* label: hidden when collapsed */}
                    {!collapsed && (
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* footer: show compact icon only when collapsed (no empty text) */}
        <div className="mt-4 border-t pt-3">
          {!collapsed ? (
            <>
              <div className="text-xs text-slate-400 px-2">Signed in as <strong className="text-slate-700">Staff</strong></div>
              <div className="mt-3 px-2">
                <button
                  className="w-full text-sm px-3 py-2 rounded-md border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-center">
              <button
                className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <Icon.logout />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile slide-over (small devices) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-4 shadow-lg overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Staff</div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-slate-100" aria-label="Close menu">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                  <path fill="currentColor" d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
                </svg>
              </button>
            </div>

            <nav>
              <ul className="space-y-2">
                {NAV.map((item) => {
                  const active = isActivePath(pathname, item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="w-6 h-6"><item.icon/></span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6">
              <button
                className="w-full text-sm px-3 py-2 rounded-md border hover:bg-slate-50"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
