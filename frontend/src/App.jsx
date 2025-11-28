// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MemberLogin from "./pages/auth/MemberLogin";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
import MemberSignup from "./pages/auth/MemberSignup";
import StaffLogin from "./pages/auth/StaffLogin";
import ProtectedMember from "./components/ProtectedMember";
import MemberView from "./pages/member/MemberView";
import BookDetail from "./pages/member/BookDetail";
import Profile from "./pages/member/Profile";
import ProtectedStaff from "./components/ProtectedStaff";
import StaffLayout from "./components/layout/StaffLayout";
import StaffView from "./pages/staff/StaffView";
import PaymentsPage from "./pages/staff/PaymentPage";
import BooksListPage from "./pages/staff/Bookslist";
import CreateBook from "./pages/staff/components/CreateBook";
import EditBookPage from "./pages/staff/EditBookPage";
import BookDetails from "./pages/staff/components/BookDetails";
import StaffProfile from "./pages/staff/StaffProfile";
import Layout from "./components/layout/Layout";
import PrivacyPolicy from "./pages/legalpages/PrivacyPolicy";
import TermsAndConditions from "./pages/legalpages/TermsAndConditions";

// Ensure your index.js (or entry) wraps <App /> with <BrowserRouter>
// e.g. ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, ...)

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/member/login" replace />} />

        <Route
          path="/member/login"
          element={
            <RedirectIfLoggedIn>
              <MemberLogin />
            </RedirectIfLoggedIn>
          }
        />

        <Route
          path="/member/signup"
          element={
            <RedirectIfLoggedIn>
              <MemberSignup />
            </RedirectIfLoggedIn>
          }
        />
        <Route 
        path="/privacy"
        element={<PrivacyPolicy/>}
        />
        <Route 
        path="/termsandconditions"
        element={<TermsAndConditions/>}
        />

        

        <Route
          path="/staff/login"
          element={
            <RedirectIfLoggedIn>
              <StaffLogin />
            </RedirectIfLoggedIn>
          }
        />

        {/* Member-protected routes */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedMember>
              <MemberView />
            </ProtectedMember>
          }
        />
        <Route
          path="/books/:id"
          element={
            <ProtectedMember>
              <BookDetail />
            </ProtectedMember>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedMember>
              <Profile />
            </ProtectedMember>
          }
        />

        {/* Staff routes: protected and using StaffLayout (sidebar + outlet) */}
        <Route
          path="/staff"
          element={
            <ProtectedStaff>
              <StaffLayout />
            </ProtectedStaff>
          }
        >
          {/* when user visits /staff -> redirect to /staff/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* staff sub-routes (rendered inside StaffLayout's Outlet) */}
          <Route path="dashboard" element={<StaffView />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="books" element={<BooksListPage />} />
          <Route path="books/create" element={<CreateBook />} />
          <Route path="books/:id/edit" element={<EditBookPage />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="reports" element={<div>Reports (stub)</div>} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        {/* Fallback: redirect unknown to login */}
        <Route path="*" element={<Navigate to="/member/login" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
