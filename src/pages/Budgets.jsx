import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { getBudgetStatus } from "../utils/insights";
import { format } from "date-fns";

export default function Budgets() {
  const { transactions, categories, budgets, setBudget, deleteBudget } = useApp();
  const month = format(new Date(), "yyyy-MM");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const status = getBudgetStatus(transactions, budgets, categories);
  const [form, setForm] = useState({ categoryId: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAddBudget(e) {
    e.preventDefault();
    if (!form.categoryId) { setError("Pilih kategori."); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Masukkan nominal anggaran."); return; }
    setSaving(true);
    setError("");
    try {
      await setBudget(form.categoryId, month, Number(form.amount));
      setForm({ categoryId: "", amount: "" });
    } catch { setError("Gagal menyimpan."); }
    finally { setSaving(false); }
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Anggaran</h1>
        <p className="page-subtitle">Kelola batas pengeluaran per kategori — {format(new Date(), "MMMM yyyy")}</p>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: "1.2fr 2fr" }}>
        {/* Add Budget Form */}
        <div className="card" style={{ height: "fit-content" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Atur Anggaran Baru</div>
          <form onSubmit={handleAddBudget} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                <option value="">-- Pilih Kategori --</option>
                {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nominal Anggaran</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 13 }}>Rp</span>
                <input className="form-input" style={{ paddingLeft: 36 }} type="number" min={0} placeholder="500000" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            {error && <div style={{ color: "var(--red)", fontSize: 12 }}>⚠️ {error}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Anggaran"}</button>
          </form>
        </div>

        {/* Budget list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {status.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🎯</div>
                <div className="empty-state-title">Belum ada anggaran</div>
                <div className="empty-state-desc">Atur anggaran untuk mengontrol pengeluaran Anda</div>
              </div>
            </div>
          ) : (
            status.map((b) => {
              const pctClamped = Math.min(b.percentage, 100);
              const isDanger = b.percentage > 100;
              const isWarn = b.percentage >= 70 && b.percentage <= 100;
              const progressCls = isDanger ? "progress-danger" : isWarn ? "progress-warning" : "progress-safe";
              return (
                <div key={b.id} className="card" style={{ borderLeft: `3px solid ${isDanger ? "var(--red)" : isWarn ? "var(--orange)" : "var(--green)"}` }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: b.categoryColor + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {categories.find((c) => c.id === b.categoryId)?.icon || "📦"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{b.categoryName}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {formatCurrency(b.spent, true)} dari {formatCurrency(b.amount, true)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`badge ${isDanger ? "badge-expense" : isWarn ? "badge-warning" : "badge-income"}`}>
                        {b.percentage}%
                      </span>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteBudget(b.id)} title="Hapus">🗑️</button>
                    </div>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className={`progress-bar-fill ${progressCls}`} style={{ width: `${pctClamped}%` }} />
                  </div>
                  {isDanger && (
                    <div style={{ marginTop: 10, background: "var(--red-light)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 6 }}>
                      🚨 Anggaran terlampaui sebesar {formatCurrency(b.spent - b.amount, true)}!
                    </div>
                  )}
                  {isWarn && !isDanger && (
                    <div style={{ marginTop: 10, background: "var(--orange-light)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 12, color: "var(--orange)", display: "flex", alignItems: "center", gap: 6 }}>
                      ⚠️ Mendekati batas anggaran — sisa {formatCurrency(b.amount - b.spent, true)}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Categories without budget */}
          {expenseCategories.filter((c) => !budgets.find((b) => b.categoryId === c.id && b.month === month)).length > 0 && (
            <div className="card" style={{ borderStyle: "dashed" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>Kategori tanpa anggaran</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {expenseCategories.filter((c) => !budgets.find((b) => b.categoryId === c.id && b.month === month)).map((c) => (
                  <span key={c.id} className="badge badge-info" style={{ cursor: "pointer" }} onClick={() => setForm((f) => ({ ...f, categoryId: c.id }))}>
                    {c.icon} {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
