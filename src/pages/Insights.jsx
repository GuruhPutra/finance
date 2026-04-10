import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { getTopSpendingCategories, getMonthlyTrend, getSavingsRate, getSmartRecommendations } from "../utils/insights";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const BASE_CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(13,13,20,0.95)", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1,
      titleColor: "#f0f0f5", bodyColor: "#8888aa", padding: 12, cornerRadius: 10,
      callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed.y ?? ctx.parsed)}` },
    },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#555570", font: { size: 11 } } },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#555570", font: { size: 11 }, callback: (v) => "Rp " + Intl.NumberFormat("id-ID", { notation: "compact" }).format(v) },
    },
  },
};

export default function Insights() {
  const { transactions, categories, budgets } = useApp();

  const savingsRate = getSavingsRate(transactions);
  const trend = getMonthlyTrend(transactions, 6);
  const topCategories = getTopSpendingCategories(transactions, categories, 5);
  const recommendations = getSmartRecommendations(transactions, budgets, categories);

  const barData = {
    labels: topCategories.map((c) => c.label),
    datasets: [{
      data: topCategories.map((c) => c.total),
      backgroundColor: topCategories.map((c) => c.color + "aa"),
      borderColor: topCategories.map((c) => c.color),
      borderWidth: 1.5, borderRadius: 8,
    }],
  };

  const lineData = {
    labels: trend.map((t) => t.month),
    datasets: [
      {
        label: "Tabungan",
        data: trend.map((t) => t.savings),
        borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#6366f1",
      },
      {
        label: "Pengeluaran",
        data: trend.map((t) => t.expense),
        borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.06)",
        tension: 0.4, fill: false, pointRadius: 4, pointBackgroundColor: "#ef4444",
      },
    ],
  };

  const savingsColor = savingsRate >= 30 ? "var(--green)" : savingsRate >= 10 ? "var(--orange)" : "var(--red)";
  const savingsLabel = savingsRate >= 30 ? "Sangat Baik 🎉" : savingsRate >= 10 ? "Cukup Baik ⚠️" : "Perlu Ditingkatkan 🚨";

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Insight & Analisis</h1>
        <p className="page-subtitle">Analisis perilaku keuangan dan rekomendasi cerdas</p>
      </div>

      {/* Stats — grid-4 collapses via CSS */}
      <div className="grid grid-4 mb-4">
        <div className="card text-center" style={{ background: `linear-gradient(135deg, ${savingsColor}11, ${savingsColor}05)`, borderColor: savingsColor + "33" }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: savingsColor }}>{savingsRate}%</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>Tingkat Tabungan</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{savingsLabel}</div>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent)" }}>{topCategories.length}</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>Kategori Aktif</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Dengan pengeluaran</div>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: 36, fontWeight: 900, color: "var(--blue)" }}>{transactions.length}</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>Total Transaksi</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Semua waktu</div>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--purple)", marginTop: 4 }}>
            {formatCurrency(topCategories[0]?.total || 0, true)}
          </div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>Pengeluaran Terbesar</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }} className="truncate">{topCategories[0]?.label || "—"}</div>
        </div>
      </div>

      {/* Charts — grid-2 collapses on tablet */}
      <div className="grid grid-2 mb-4">
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Top 5 Kategori Pengeluaran</div>
          <div className="text-secondary text-sm mb-4">Berdasarkan semua waktu</div>
          {topCategories.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}><div className="empty-state-icon">📊</div><div className="empty-state-desc">Belum ada data</div></div>
          ) : (
            <div style={{ height: 220 }}><Bar data={barData} options={BASE_CHART_OPTS} /></div>
          )}
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Tren Tabungan & Pengeluaran</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>● Tabungan</span>
            <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>● Pengeluaran</span>
          </div>
          {trend.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}><div className="empty-state-icon">📈</div><div className="empty-state-desc">Belum ada data</div></div>
          ) : (
            <div style={{ height: 220 }}><Line data={lineData} options={BASE_CHART_OPTS} /></div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🤖 Rekomendasi Cerdas</div>
        <div className="text-secondary text-sm mb-4">Insights berdasarkan pola keuangan Anda</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recommendations.map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-input)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 20, lineHeight: 1.3, flexShrink: 0 }}>{tip.icon}</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {topCategories.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Rincian per Kategori</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topCategories.map((cat, i) => {
              const pct = Math.round((cat.total / topCategories[0].total) * 100);
              return (
                <div key={cat.categoryId}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", width: 16, flexShrink: 0 }}>#{i + 1}</span>
                      <div className="color-dot" style={{ background: cat.color }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }} className="truncate">{cat.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: cat.color, flexShrink: 0, marginLeft: 8 }}>{formatCurrency(cat.total, true)}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
