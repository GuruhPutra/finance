import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";

const EMPTY_ACC = { name: "", icon: "💳", type: "cash", color: "#6366f1", initialBalance: "" };
const ACC_TYPES = [
  { value: "cash", label: "Tunai", icon: "💵" },
  { value: "bank", label: "Rekening Bank", icon: "🏦" },
  { value: "ewallet", label: "E-Wallet", icon: "📱" },
  { value: "other", label: "Lainnya", icon: "📂" },
];
const ICONS = ["💵","🏦","📱","💳","💰","🏧","🪙","💎","📂","🔑"];
const COLORS = ["#6366f1","#10b981","#3b82f6","#f59e0b","#ef4444","#a855f7","#f43f5e","#06b6d4","#84cc16","#ec4899"];

export default function Accounts() {
  const { accounts, accountBalances, totalBalance, addAccount, updateAccount, deleteAccount } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_ACC);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function openAdd() { setForm(EMPTY_ACC); setEditTarget(null); setFormOpen(true); }
  function openEdit(acc) {
    setForm({ name: acc.name, icon: acc.icon || "💳", type: acc.type || "cash", color: acc.color || "#6366f1", initialBalance: acc.initialBalance || 0 });
    setEditTarget(acc); setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, initialBalance: Number(form.initialBalance) || 0 };
      if (editTarget) await updateAccount(editTarget.id, payload);
      else await addAccount(payload);
      setFormOpen(false);
    } finally { setSaving(false); }
  }

  return (
    <div className="animate-fade">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Akun Keuangan</h1>
          <p className="page-subtitle">Total saldo: {formatCurrency(totalBalance)}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Akun Baru</button>
      </div>

      <div className="grid grid-3">
        {accounts.map((acc) => {
          const bal = accountBalances[acc.id] || 0;
          return (
            <div key={acc.id} className="card" style={{ borderTop: `3px solid ${acc.color || "var(--accent)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: (acc.color || "#6366f1") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {acc.icon || "💳"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }} className="truncate">{acc.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {ACC_TYPES.find((t) => t.value === acc.type)?.label || acc.type}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(acc)}>✏️</button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(acc.id)}>🗑️</button>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 20, color: bal >= 0 ? "var(--green)" : "var(--red)", letterSpacing: "-0.5px" }}>
                {formatCurrency(bal, true)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Saldo awal: {formatCurrency(acc.initialBalance || 0, true)}
              </div>
            </div>
          );
        })}
        <div
          className="card"
          style={{ border: "1.5px dashed var(--border)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 130, gap: 8 }}
          onClick={openAdd}
        >
          <div style={{ fontSize: 32, opacity: 0.3 }}>＋</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Tambah Akun</div>
        </div>
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editTarget ? "Edit Akun" : "Akun Baru"}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setFormOpen(false)} style={{ fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Akun</label>
                  <input className="form-input" required placeholder="Contoh: BCA Utama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Jenis</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                      {ACC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Saldo Awal</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 13 }}>Rp</span>
                      <input className="form-input" style={{ paddingLeft: 36 }} type="number" min={0} placeholder="0" value={form.initialBalance} onChange={(e) => setForm((f) => ({ ...f, initialBalance: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ikon</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ICONS.map((ic) => (
                      <button key={ic} type="button" onClick={() => setForm((f) => ({ ...f, icon: ic }))} style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: form.icon === ic ? "var(--accent-light)" : "var(--bg-input)", border: form.icon === ic ? "1.5px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer", fontSize: 18 }}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Warna</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid white" : "2px solid transparent", cursor: "pointer", boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none" }} />
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
            <div className="modal-header"><span className="modal-title">Hapus Akun?</span></div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Semua transaksi dari akun ini tidak akan terhapus.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger" onClick={async () => { await deleteAccount(deleteConfirm); setDeleteConfirm(null); }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
