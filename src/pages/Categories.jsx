import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { getCurrentMonthStats, getExpenseByCategory } from "../utils/insights";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const EMPTY_CAT = { name: "", icon: "📦", color: "#6366f1", type: "expense" };
const ICONS = ["🍔","🚗","🛍️","💊","🎬","📚","💡","📦","🏠","✈️","🎵","🧴","💻","🐾","🍕","☕","🎮","👔","💐","🔧","📱","🎓","🏋️","🌐","🎁","💰","📈","💻","🎤","🏦"];
const COLORS = ["#6366f1","#10b981","#3b82f6","#f59e0b","#ef4444","#a855f7","#f43f5e","#06b6d4","#84cc16","#ec4899","#14b8a6","#f97316","#8b5cf6","#0ea5e9"];

function parseDate(d) {
  if (!d) return new Date();
  if (typeof d === "string") { try { return new Date(d); } catch { return new Date(); } }
  if (d?.toDate) return d.toDate();
  return new Date(d);
}

export default function Categories() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useApp();
  const [tab, setTab] = useState("expense");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const filtered = categories.filter((c) => c.type === tab);

  function getMonthSpending(catId) {
    return transactions
      .filter((t) => {
        const d = parseDate(t.date);
        return t.type === "expense" && t.categoryId === catId && isWithinInterval(d, { start, end });
      })
      .reduce((s, t) => s + t.amount, 0);
  }
  function getTotalSpending(catId) {
    return transactions.filter((t) => t.type === "expense" && t.categoryId === catId).reduce((s, t) => s + t.amount, 0);
  }

  function openAdd() { setForm({ ...EMPTY_CAT, type: tab }); setEditTarget(null); setFormOpen(true); }
  function openEdit(cat) { setForm({ name: cat.name, icon: cat.icon || "📦", color: cat.color || "#6366f1", type: cat.type }); setEditTarget(cat); setFormOpen(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) await updateCategory(editTarget.id, form);
      else await addCategory(form);
      setFormOpen(false);
    } finally { setSaving(false); }
  }

  return (
    <div className="animate-fade">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Kategori</button>
      </div>

      {/* Tabs */}
      <div className="type-toggle mb-4" style={{ maxWidth: 300 }}>
        <button type="button" className={`type-toggle-btn ${tab === "expense" ? "active-expense" : ""}`} onClick={() => setTab("expense")}>🔴 Pengeluaran</button>
        <button type="button" className={`type-toggle-btn ${tab === "income" ? "active-income" : ""}`} onClick={() => setTab("income")}>🟢 Pemasukan</button>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <div className="empty-state-title">Belum ada kategori</div>
            <div className="empty-state-desc">Tambahkan kategori {tab === "expense" ? "pengeluaran" : "pemasukan"}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((cat) => {
            const monthSpend = tab === "expense" ? getMonthSpending(cat.id) : 0;
            const totalSpend = tab === "expense" ? getTotalSpending(cat.id) : 0;
            return (
              <div key={cat.id} className="card" style={{ borderLeft: `3px solid ${cat.color || "var(--accent)"}` }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: (cat.color || "#6366f1") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      {cat.icon || "📦"}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(cat)}>✏️</button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(cat.id)}>🗑️</button>
                  </div>
                </div>
                {tab === "expense" && (
                  <>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Bulan ini</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: monthSpend > 0 ? "var(--red)" : "var(--text-muted)" }}>{formatCurrency(monthSpend, true)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Total: {formatCurrency(totalSpend, true)}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editTarget ? "Edit Kategori" : "Kategori Baru"}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setFormOpen(false)} style={{ fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Jenis</label>
                  <div className="type-toggle">
                    <button type="button" className={`type-toggle-btn ${form.type === "expense" ? "active-expense" : ""}`} onClick={() => setForm((f) => ({ ...f, type: "expense" }))}>🔴 Pengeluaran</button>
                    <button type="button" className={`type-toggle-btn ${form.type === "income" ? "active-income" : ""}`} onClick={() => setForm((f) => ({ ...f, type: "income" }))}>🟢 Pemasukan</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Kategori</label>
                  <input className="form-input" required placeholder="Contoh: Makan Siang" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ikon</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 120, overflowY: "auto" }}>
                    {ICONS.map((ic) => (
                      <button key={ic} type="button" onClick={() => setForm((f) => ({ ...f, icon: ic }))} style={{ width: 34, height: 34, borderRadius: "var(--radius-sm)", background: form.icon === ic ? "var(--accent-light)" : "var(--bg-input)", border: form.icon === ic ? "1.5px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer", fontSize: 16 }}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Warna</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: form.color === c ? "3px solid white" : "2px solid transparent", cursor: "pointer", boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan..." : editTarget ? "Simpan" : "Tambah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Hapus Kategori?</span></div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Transaksi yang menggunakan kategori ini tidak akan terhapus.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger" onClick={async () => { await deleteCategory(deleteConfirm); setDeleteConfirm(null); }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
