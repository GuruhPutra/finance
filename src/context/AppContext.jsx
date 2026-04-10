import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  db, collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc,
} from "../firebase";

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

async function seedDefaults(existingCategories, existingAccounts) {
  if (existingCategories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      const { id, ...data } = cat;
      await setDoc(doc(db, "categories", id), { ...data, createdAt: serverTimestamp() });
    }
  }
  if (existingAccounts.length === 0) {
    for (const acc of DEFAULT_ACCOUNTS) {
      const { id, ...data } = acc;
      await setDoc(doc(db, "accounts", id), { ...data, createdAt: serverTimestamp() });
    }
  }
}

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    let seeded = false;
    const unsubCat = onSnapshot(query(collection(db, "categories"), orderBy("name")), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(data);
      if (!seeded) {
        const unsubAcc = onSnapshot(query(collection(db, "accounts"), orderBy("name")), (snapAcc) => {
          const accs = snapAcc.docs.map((d) => ({ id: d.id, ...d.data() }));
          setAccounts(accs);
          if (!seeded) { seeded = true; seedDefaults(data, accs); }
        });
        return () => unsubAcc();
      }
    });

    const unsubAcc = onSnapshot(query(collection(db, "accounts"), orderBy("name")), (snap) => {
      setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubTx = onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubBudget = onSnapshot(collection(db, "budgets"), (snap) => {
      setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubCat(); unsubAcc(); unsubTx(); unsubBudget(); };
  }, []);

  // Transactions CRUD
  const addTransaction = useCallback(async (data) => {
    await addDoc(collection(db, "transactions"), { ...data, createdAt: serverTimestamp() });
  }, []);
  const updateTransaction = useCallback(async (id, data) => {
    await updateDoc(doc(db, "transactions", id), data);
  }, []);
  const deleteTransaction = useCallback(async (id) => {
    await deleteDoc(doc(db, "transactions", id));
  }, []);

  // Categories CRUD
  const addCategory = useCallback(async (data) => {
    await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
  }, []);
  const updateCategory = useCallback(async (id, data) => {
    await updateDoc(doc(db, "categories", id), data);
  }, []);
  const deleteCategory = useCallback(async (id) => {
    await deleteDoc(doc(db, "categories", id));
  }, []);

  // Accounts CRUD
  const addAccount = useCallback(async (data) => {
    await addDoc(collection(db, "accounts"), { ...data, createdAt: serverTimestamp() });
  }, []);
  const updateAccount = useCallback(async (id, data) => {
    await updateDoc(doc(db, "accounts", id), data);
  }, []);
  const deleteAccount = useCallback(async (id) => {
    await deleteDoc(doc(db, "accounts", id));
  }, []);

  // Budgets CRUD
  const setBudget = useCallback(async (categoryId, month, amount) => {
    const budgetId = `${categoryId}_${month}`;
    await setDoc(doc(db, "budgets", budgetId), { categoryId, month, amount, updatedAt: serverTimestamp() });
  }, []);
  const deleteBudget = useCallback(async (id) => {
    await deleteDoc(doc(db, "budgets", id));
  }, []);

  // Compute account balances
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
