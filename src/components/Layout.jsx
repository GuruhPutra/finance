import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";

const NAV_ITEMS = [
  { to: "/", icon: "⚡", label: "Dashboard" },
  { to: "/transactions", icon: "💳", label: "Transaksi" },
  { to: "/budgets", icon: "🎯", label: "Anggaran" },
  { to: "/insights", icon: "📊", label: "Insight" },
  { to: "/accounts", icon: "🏦", label: "Akun" },
  { to: "/categories", icon: "🏷️", label: "Kategori" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalBalance, isOnline } = useApp();
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="app-shell">
      {!isOnline && (
        <div className="offline-banner">
          📡 Mode Offline — Data tersimpan lokal & akan disinkronkan saat online
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 200,
        transform: sidebarOpen ? "translateX(0)" : undefined,
        transition: "transform var(--transition-slow)",
      }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "var(--shadow-accent)",
            }}>💹</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>FinanceOS</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>Smart Finance</div>
            </div>
          </div>
        </div>

        {/* Balance Banner */}
        <div style={{ margin: "12px", padding: "14px", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))", border: "1px solid rgba(99,102,241,0.15)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Saldo</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginTop: 2, letterSpacing: "-0.5px" }}>
            {formatCurrency(totalBalance, true)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "var(--green)" : "var(--orange)", boxShadow: isOnline ? "0 0 6px var(--green)" : "0 0 6px var(--orange)" }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{isOnline ? "Tersinkron" : "Offline"}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                marginBottom: 2,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                transition: "all var(--transition)",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-card)" : "transparent",
                borderLeft: isActive ? `3px solid var(--accent)` : "3px solid transparent",
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
          Smart Finance Manager v1.0
        </div>
      </aside>

      {/* Mobile Header */}
      <div style={{
        display: "none",
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: "var(--header-height)",
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
        padding: "0 16px",
        justifyContent: "space-between",
        zIndex: 150,
      }} className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>💹</span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>FinanceOS</span>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ fontSize: 20 }}
        >☰</button>
      </div>

      {/* Main */}
      <main className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0) !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
