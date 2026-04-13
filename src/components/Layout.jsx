import React, { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";

const NAV_ITEMS = [
  { to: "/", icon: "⚡", label: "Dashboard" },
  { to: "/transactions", icon: "💳", label: "Transaksi" },
  { to: "/budgets", icon: "🎯", label: "Anggaran" },
  { to: "/insights", icon: "📊", label: "Insight" },
  { to: "/accounts", icon: "🏦", label: "Akun" },
  { to: "/categories", icon: "🏷️", label: "Kategori" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalBalance, isOnline } = useApp();
  const { user, logout } = useAuth();

  const userInitial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const userName = user?.displayName || user?.email?.split("@")[0] || "Pengguna";

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <div className="app-shell">
      {!isOnline && (
        <div className="offline-banner">
          📡 Mode Offline — Data tersimpan lokal & akan disinkronkan saat online
        </div>
      )}

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 199,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, boxShadow: "var(--shadow-accent)",
            }}>💹</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>FinanceOS</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>Smart Finance</div>
            </div>
          </div>
        </div>

        {/* Balance Banner */}
        <div style={{
          margin: "10px",
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Saldo</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginTop: 2, letterSpacing: "-0.5px" }}>
            {formatCurrency(totalBalance)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isOnline ? "var(--green)" : "var(--orange)",
              boxShadow: isOnline ? "0 0 6px var(--green)" : "0 0 6px var(--orange)",
            }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{isOnline ? "Tersinkron" : "Offline"}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "6px 8px", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeSidebar}
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
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div style={{
          margin: "8px",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: "var(--radius-full)",
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>{userInitial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Akun Aktif</div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="btn btn-ghost btn-icon btn-sm"
            title="Keluar"
            style={{ fontSize: 14, flexShrink: 0, padding: "4px 6px" }}
          >🚪</button>
        </div>

        <div style={{ padding: "8px 16px 12px", fontSize: 10, color: "var(--text-muted)" }}>
          Smart Finance Manager v1.0
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>💹</span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>FinanceOS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? "var(--green)" : "var(--orange)" }}>
            {formatCurrency(totalBalance)}
          </span>
          <button
            id="mobile-logout-btn"
            className="btn btn-ghost btn-icon"
            onClick={logout}
            style={{ fontSize: 16, lineHeight: 1 }}
            aria-label="Keluar"
          >🚪</button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ fontSize: 20, lineHeight: 1 }}
            aria-label="Toggle menu"
          >☰</button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
