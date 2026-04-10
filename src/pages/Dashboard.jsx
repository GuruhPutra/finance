import React, { useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatDate, formatRelative } from "../utils/formatters";
import { getMonthlyTrend, getCurrentMonthStats, getSavingsRate, getExpenseByCategory } from "../utils/insights";
import TransactionForm from "../components/TransactionForm";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(13,13,20,0.95)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      titleColor: "#f0f0f5",
      bodyColor: "#8888aa",
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#555570", font: { size: 11 } } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#555570", font: { size: 11 }, callback: (v) => "Rp " + Intl.NumberFormat("id-ID", { notation: "compact" }).format(v) } },
  },
};

const DOUGHNUT_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: "right", labels: { color: "#8888aa", font: { size: 11 }, padding: 12, boxWidth: 10, borderRadius: 5 } },
    tooltip: {
      backgroundColor: "rgba(13,13,20,0.95)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      titleColor: "#f0f0f5",
      bodyColor: "#8888aa",
      padding: 12,
      cornerRadius: 10,
      callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}` },
    },
  },
  cutout: "72%",
};

export default function Dashboard() {
  const { transactions, categories, accounts, budgets, accountBalances, totalBalance, loading } = useApp();
  const [formOpen, setFormOpen] = useState(false);

  const { income, expense, savings } = getCurrentMonthStats(transactions);
  const savingsRate = getSavingsRate(transactions);
  const trend = getMonthlyTrend(transactions, 6);
  const expByCategory = getExpenseByCategory(transactions, categories);
  const recent = transactions.slice(0, 8);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 40 }} className="loading-spin">⚙️</div>
      <div style={{ color: "var(--text-secondary)" }}>Memuat data...</div>
    </div>
  );

  const lineData = {
    labels: trend.map((t) => t.month),
    datasets: [
      {
        label: "Pemasukan",
        data: trend.map((t) => t.income),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#10b981",
      },
      {
        label: "Pengeluaran",
        data: trend.map((t) => t.expense),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.06)",
        tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#ef4444",
      },
    ],
  };

  const doughnutData = {
    labels: expByCategory.map((c) => c.label),
    datasets: [{
      data: expByCategory.map((c) => c.total),
      backgroundColor: expByCategory.map((c) => c.color + "cc"),
      borderColor: expByCategory.map((c) => c.color),
      borderWidth: 1.5,
      hoverOffset: 4,
    }],
  };

  return (
    <div className="animate-fade">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang di FinanceOS — ringkasan keuangan Anda bulan ini</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>＋ Transaksi</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4 mb-4">
        <StatCard label="Total Saldo" value={formatCurrency(totalBalance)} icon="💼" color="var(--blue)" cls="stat-card-balance" />
        <StatCard label="Pemasukan Bulan Ini" value={formatCurrency(income)} icon="📈" color="var(--green)" cls="stat-card-income" />
        <StatCard label="Pengeluaran Bulan Ini" value={formatCurrency(expense)} icon="📉" color="var(--red)" cls="stat-card-expense" />
        <StatCard label="Tabungan Bulan Ini" value={formatCurrency(savings)} icon="💰" color="var(--accent)" sub={`${savingsRate}% dari pemasukan`} cls="stat-card-savings" />
      </div>

      {/* Charts */}
      <div className="grid grid-2 mb-4" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Tren Pemasukan vs Pengeluaran</div>
              <div className="text-secondary text-sm">6 bulan terakhir</div>
            </div>
            <div className="flex gap-2">
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>● Pemasukan</span>
              <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>● Pengeluaran</span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <Line data={lineData} options={{ ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } }} />
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Pengeluaran per Kategori</div>
          <div className="text-secondary text-sm mb-4">Bulan ini</div>
          {expByCategory.length > 0 ? (
            <div style={{ height: 220 }}>
              <Doughnut data={doughnutData} options={DOUGHNUT_OPTS} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "40px 0" }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-desc">Belum ada pengeluaran bulan ini</div>
            </div>
          )}
        </div>
      </div>

      {/* Accounts + Recent TX */}
      <div className="grid grid-2">
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Saldo Akun</div>
          {accounts.length === 0 ? (
            <div className="text-muted text-sm">Belum ada akun</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {accounts.map((acc) => (
                <div key={acc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-input)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: acc.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{acc.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{acc.type}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: (accountBalances[acc.id] || 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                    {formatCurrency(accountBalances[acc.id] || 0, true)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Transaksi Terbaru</div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-desc">Belum ada transaksi</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recent.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "var(--radius-md)", transition: "background var(--transition)" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: (cat?.color || "#6366f1") + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{cat?.icon || "💳"}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{cat?.name || "Lainnya"}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatRelative(tx.date)}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: tx.type === "income" ? "var(--green)" : "var(--red)" }}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, true)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

function StatCard({ label, value, icon, color, sub, cls }) {
  return (
    <div className={`stat-card ${cls}`}>
      <div className="stat-card-icon" style={{ background: color + "20" }}>
        <span>{icon}</span>
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}
