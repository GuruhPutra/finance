import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { formatDateInput } from "../utils/formatters";

const EMPTY = { type: "expense", amount: "", categoryId: "", accountId: "", date: "", note: "" };

export default function TransactionForm({ open, onClose, initial = null }) {
  const { categories, accounts, addTransaction, updateTransaction } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          type: initial.type || "expense",
          amount: initial.amount || "",
          categoryId: initial.categoryId || "",
          accountId: initial.accountId || "",
          date: initial.date || formatDateInput(new Date()),
          note: initial.note || "",
        });
      } else {
        setForm({ ...EMPTY, date: formatDateInput(new Date()) });
      }
      setError("");
    }
  }, [open, initial]);

  if (!open) return null;

  const filteredCategories = categories.filter((c) => c.type === form.type);

  function set(field, value) {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === "type") updated.categoryId = "";
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError("Jumlah harus lebih dari 0."); return; }
    if (!form.categoryId) { setError("Pilih kategori."); return; }
    if (!form.accountId) { setError("Pilih akun."); return; }
    if (!form.date) { setError("Pilih tanggal."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (initial) await updateTransaction(initial.id, payload);
      else await addTransaction(payload);
      onClose();
    } catch (err) {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <span className="modal-title">{initial ? "Edit Transaksi" : "Tambah Transaksi"}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type toggle */}
            <div className="type-toggle">
              <button
                type="button"
                className={`type-toggle-btn ${form.type === "expense" ? "active-expense" : ""}`}
                onClick={() => set("type", "expense")}
              >🔴 Pengeluaran</button>
              <button
                type="button"
                className={`type-toggle-btn ${form.type === "income" ? "active-income" : ""}`}
                onClick={() => set("type", "income")}
              >🟢 Pemasukan</button>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Jumlah</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 13 }}>Rp</span>
                <input
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid">
              {/* Category */}
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              {/* Account */}
              <div className="form-group">
                <label className="form-label">Akun</label>
                <select className="form-select" value={form.accountId} onChange={(e) => set("accountId", e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input className="form-input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>

            {/* Note */}
            <div className="form-group">
              <label className="form-label">Catatan (opsional)</label>
              <input className="form-input" type="text" placeholder="Tambahkan catatan..." value={form.note} onChange={(e) => set("note", e.target.value)} />
            </div>

            {error && (
              <div style={{ background: "var(--red-light)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-md)", padding: "10px 14px", color: "var(--red)", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
