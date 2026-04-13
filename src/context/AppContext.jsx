import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  db, collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc,
} from "../firebase";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

const DEFAULT_CATEGORIES = [
  { id: "cat_food", name: "Makanan & Minuman", icon: "🍔", color: "#f59e0b", type: "expense" },
  { id: "cat_transport", name: "Transportasi", icon: "🚗", color: "#3b82f6", type: "expense" },
  { id: "cat_shopping", name: "Belanja", icon: "🛍️", color: "#a855f7", type: "expense" },
  { id: "cat_health", name: "Kesehatan", icon: "💊", color: "#10b981", type: "expense" },
  { id: "cat_entertainment", name: "Hiburan", icon: "🎬", color: "#f43f5e", type: "expense" },
  { id: "cat_education", name: "Pendidikan", icon: "📚", color: "#06b6d4", type: "expense" },
  { id: "cat_bills", name: "Tagihan", icon: "💡", color: "#ef4444", type: "expense" },
  { id: "cat_other_exp", name: "Lainnya", icon: "📦", color: "#6366f1", type: "expense" },
  { id: "cat_salary", name: "Gaji", icon: "💰", color: "#10b981", type: "income" },
  { id: "cat_freelance", name: "Freelance", icon: "💻", color: "#3b82f6", type: "income" },
  { id: "cat_investment", name: "Investasi", icon: "📈", color: "#a855f7", type: "income" },
  { id: "cat_other_inc", name: "Pemasukan Lain", icon: "🎁", color: "#f59e0b", type: "income" },
];

const DEFAULT_ACCOUNTS = [
  { id: "acc_cash", name: "Kas / Tunai", icon: "💵", type: "cash", color: "#10b981", initialBalance: 0 },
  { id: "acc_bank", name: "Rekening Bank", icon: "🏦", type: "bank", color: "#3b82f6", initialBalance: 0 },
  { id: "acc_ewallet", name: "E-Wallet", icon: "📱", type: "ewallet", color: "#a855f7", initialBalance: 0 },
];

// Helper: returns the root collection path scoped to the current user
function userCol(uid, col) {
  return collection(db, "users", uid, col);
}

// Helper: returns a doc ref scoped to the current user
function userDoc(uid, col, id) {
  return doc(db, "users", uid, col, id);
}

async function seedDefaults(uid, existingCategories, existingAccounts) {
  if (existingCategories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      const { id, ...data } = cat;
      await setDoc(userDoc(uid, "categories", id), { ...data, createdAt: serverTimestamp() });
    }
  }
  if (existingAccounts.length === 0) {
    for (const acc of DEFAULT_ACCOUNTS) {
      const { id, ...data } = acc;
      await setDoc(userDoc(uid, "accounts", id), { ...data, createdAt: serverTimestamp() });
    }
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/offline listener
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Firestore listeners — re-run whenever the authenticated user changes
  useEffect(() => {
    if (!uid) {
      // User logged out — clear all state
      setTransactions([]);
      setCategories([]);
      setAccounts([]);
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let seeded = false;

    const unsubCat = onSnapshot(
      query(userCol(uid, "categories"), orderBy("name")),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(data);
        if (!seeded) {
          seeded = true;
          // Seed defaults only on first load and only if collections are empty
          const unsubAccOnce = onSnapshot(
            query(userCol(uid, "accounts"), orderBy("name")),
            (snapAcc) => {
              const accs = snapAcc.docs.map((d) => ({ id: d.id, ...d.data() }));
              seedDefaults(uid, data, accs);
              unsubAccOnce(); // only needed once for seeding
            }
          );
        }
      }
    );

    const unsubAcc = onSnapshot(
      query(userCol(uid, "accounts"), orderBy("name")),
      (snap) => {
        setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubTx = onSnapshot(
      query(userCol(uid, "transactions"), orderBy("date", "desc")),
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );

    const unsubBudget = onSnapshot(
      userCol(uid, "budgets"),
      (snap) => {
        setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubCat();
      unsubAcc();
      unsubTx();
      unsubBudget();
    };
  }, [uid]);

  // ── Transactions CRUD ──────────────────────────────────────────────────────
  const addTransaction = useCallback(async (data) => {
    if (!uid) return;
    await addDoc(userCol(uid, "transactions"), { ...data, createdAt: serverTimestamp() });
  }, [uid]);

  const updateTransaction = useCallback(async (id, data) => {
    if (!uid) return;
    await updateDoc(userDoc(uid, "transactions", id), data);
  }, [uid]);

  const deleteTransaction = useCallback(async (id) => {
    if (!uid) return;
    await deleteDoc(userDoc(uid, "transactions", id));
  }, [uid]);

  // ── Categories CRUD ────────────────────────────────────────────────────────
  const addCategory = useCallback(async (data) => {
    if (!uid) return;
    await addDoc(userCol(uid, "categories"), { ...data, createdAt: serverTimestamp() });
  }, [uid]);

  const updateCategory = useCallback(async (id, data) => {
    if (!uid) return;
    await updateDoc(userDoc(uid, "categories", id), data);
  }, [uid]);

  const deleteCategory = useCallback(async (id) => {
    if (!uid) return;
    await deleteDoc(userDoc(uid, "categories", id));
  }, [uid]);

  // ── Accounts CRUD ──────────────────────────────────────────────────────────
  const addAccount = useCallback(async (data) => {
    if (!uid) return;
    await addDoc(userCol(uid, "accounts"), { ...data, createdAt: serverTimestamp() });
  }, [uid]);

  const updateAccount = useCallback(async (id, data) => {
    if (!uid) return;
    await updateDoc(userDoc(uid, "accounts", id), data);
  }, [uid]);

  const deleteAccount = useCallback(async (id) => {
    if (!uid) return;
    await deleteDoc(userDoc(uid, "accounts", id));
  }, [uid]);

  // ── Budgets CRUD ───────────────────────────────────────────────────────────
  const setBudget = useCallback(async (categoryId, month, amount) => {
    if (!uid) return;
    const budgetId = `${categoryId}_${month}`;
    await setDoc(userDoc(uid, "budgets", budgetId), {
      categoryId, month, amount, updatedAt: serverTimestamp(),
    });
  }, [uid]);

  const deleteBudget = useCallback(async (id) => {
    if (!uid) return;
    await deleteDoc(userDoc(uid, "budgets", id));
  }, [uid]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const accountBalances = accounts.reduce((acc, account) => {
    const init = account.initialBalance || 0;
    const txTotal = transactions
      .filter((t) => t.accountId === account.id)
      .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    acc[account.id] = init + txTotal;
    return acc;
  }, {});

  const totalBalance = Object.values(accountBalances).reduce((s, v) => s + v, 0);

  const value = {
    transactions, categories, accounts, budgets, loading, isOnline,
    accountBalances, totalBalance,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    addAccount, updateAccount, deleteAccount,
    setBudget, deleteBudget,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
