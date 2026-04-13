import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Insights from "./pages/Insights";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

/* ─── Loading Splash ─────────────────────────────────────────────────────── */
function LoadingSplash() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: "var(--radius-md)",
        background: "linear-gradient(135deg, var(--accent), var(--purple))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, boxShadow: "var(--shadow-accent)",
        animation: "pulse 1.5s ease infinite",
      }}>💹</div>
      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Memuat...</span>
    </div>
  );
}

/* ─── Protected Route ────────────────────────────────────────────────────── */
// Hanya bisa diakses jika sudah login.
// Jika belum login, redirect ke /login dan simpan URL tujuan di `state.from`
// agar setelah login bisa diarahkan kembali.
function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <LoadingSplash />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/* ─── Public Route ───────────────────────────────────────────────────────── */
// Hanya bisa diakses jika BELUM login (misal: halaman login).
// Jika sudah login, redirect ke dashboard atau halaman sebelumnya.
function PublicRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <LoadingSplash />;

  if (user) {
    const destination = location.state?.from?.pathname || "/";
    return <Navigate to={destination} replace />;
  }

  return children;
}

/* ─── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* Public — hanya untuk tamu */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected — wajib login */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="insights" element={<Insights />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="categories" element={<Categories />} />
      </Route>

      {/* Fallback — redirect semua path tak dikenal ke dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}