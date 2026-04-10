import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Insights from "./pages/Insights";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
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

  if (!user) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </Layout>
  );
}