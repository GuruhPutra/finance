import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatDate, formatRelative } from "../utils/formatters";
import TransactionForm from "../components/TransactionForm";

export default function Transactions() {
  const { transactions, categories, accounts, deleteTransaction } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterType !== "all" && t.type !== filterType) return false;
        if (filterCategory !== "all" && t.categoryId !== filterCategory) return false;
        if (filterAccount !== "all" && t.accountId !== filterAccount) return false;
        if (search && !((t.note || "").toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.date), db = new Date(b.date);
        return sortOrder === "desc" ? db - da : da - db;
      });
  }, [transactions, filterType, filterCategory, filterAccount, search, sortOrder]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  function openEdit(tx) { setEditing(tx); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); }
  const hasFilter = search || filterType !== "all" || filterCategory !== "all" || filterAccount !== "all";

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">{filtered.length} transaksi ditemukan</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>＋ Tambah</button>
      </div>

      {/* Summary */}
      <div className="grid grid-3 mb-4">
        <div className="card text-center">
          <div className="text-secondary text-sm">Pemasukan</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--green)", marginTop: 4 }}>{formatCurrency(totalIncome, true)}</div>
        </div>
        <div className="card text-center">
          <div className="text-secondary text-sm">Pengeluaran</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--red)", marginTop: 4 }}>{formatCurrency(totalExpense, true)}</div>
        </div>
        <div className="card text-center">
          <div className="text-secondary text-sm">Selisih</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: (totalIncome - totalExpense) >= 0 ? "var(--green)" : "var(--red)", marginTop: 4 }}>
            {formatCurrency(totalIncome - totalExpense, true)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="form-input search-input" placeholder="Cari catatan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select className="form-select" value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
            <option value="all">Semua Akun</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </select>
          <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
          {hasFilter && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterType("all"); setFilterCategory("all"); setFilterAccount("all"); }}>✕ Reset</button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-title">Tidak ada transaksi</div>
            <div className="empty-state-desc">Tambahkan transaksi pertama Anda</div>
          </div>
        </div>
      ) : (
        <>
          {/* === Desktop Table (hidden on mobile via CSS) === */}
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Akun</th>
                    <th>Catatan</th>
                    <th>Jenis</th>
                    <th style={{ textAlign: "right" }}>Jumlah</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const acc = accounts.find((a) => a.id === tx.accountId);
                    return (
                      <tr key={tx.id}>
                        <td style={{ color: "var(--text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>{formatDate(tx.date)}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: (cat?.color || "#6366f1") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{cat?.icon || "📦"}</div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{cat?.name || "Lainnya"}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{acc?.icon} {acc?.name || "-"}</td>
                        <td>
                          <span className="truncate" style={{ fontSize: 12, color: tx.note ? "var(--text-secondary)" : "var(--text-muted)", display: "block", maxWidth: 140 }}>{tx.note || "—"}</span>
                        </td>
                        <td>
                          <span className={`badge ${tx.type === "income" ? "badge-income" : "badge-expense"}`}>
                            {tx.type === "income" ? "▲ Masuk" : "▼ Keluar"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: tx.type === "income" ? "var(--green)" : "var(--red)", fontSize: 13, whiteSpace: "nowrap" }}>
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, true)}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(tx)}>✏️</button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(tx.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* === Mobile Card List (shown on mobile via CSS) === */}
          <div className="tx-card-list">
            {filtered.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const acc = accounts.find((a) => a.id === tx.accountId);
              return (
                <div key={tx.id} className="card" style={{ padding: 12 }}>
                  <div className="tx-card" style={{ background: "transparent", padding: 0 }}>
                    <div className="tx-card-icon" style={{ background: (cat?.color || "#6366f1") + "22" }}>{cat?.icon || "📦"}</div>
                    <div className="tx-card-info">
                      <div className="tx-card-name">{cat?.name || "Lainnya"}</div>
                      <div className="tx-card-sub">{acc?.icon} {acc?.name || "?"} · {formatDate(tx.date)}</div>
                      {tx.note && <div className="tx-card-sub truncate" style={{ maxWidth: 180 }}>{tx.note}</div>}
                    </div>
                    <div className="tx-card-right">
                      <div className="tx-card-amount" style={{ color: tx.type === "income" ? "var(--green)" : "var(--red)" }}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, true)}
                      </div>
                      <div className="tx-card-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(tx)}>✏️</button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(tx.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Hapus Transaksi?</span></div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Tindakan ini tidak dapat dibatalkan.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger" onClick={async () => { await deleteTransaction(deleteConfirm); setDeleteConfirm(null); }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      <TransactionForm open={formOpen} onClose={closeForm} initial={editing} />
      <button className="btn-fab" onClick={() => { setEditing(null); setFormOpen(true); }} title="Tambah Transaksi">＋</button>
    </div>
  );
}
