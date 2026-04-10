import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

function parseDate(d) {
  if (!d) return new Date();
  if (typeof d === "string") return parseISO(d);
  if (d?.toDate) return d.toDate();
  return new Date(d);
}

export function getTopSpendingCategories(transactions, categories, n = 5) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const map = {};
  expenses.forEach((t) => {
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([categoryId, total]) => ({
      categoryId,
      label: categories.find((c) => c.id === categoryId)?.name || "Lainnya",
      color: categories.find((c) => c.id === categoryId)?.color || "#6366f1",
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

export function getMonthlyTrend(transactions, months = 6) {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const inRange = transactions.filter((t) => {
      const d = parseDate(t.date);
      return isWithinInterval(d, { start, end });
    });
    const income = inRange.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = inRange.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    result.push({ month: format(date, "MMM yy"), income, expense, savings: income - expense });
  }
  return result;
}

export function getSavingsRate(transactions) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const inRange = transactions.filter((t) => {
    const d = parseDate(t.date);
    return isWithinInterval(d, { start, end });
  });
  const income = inRange.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = inRange.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  if (income === 0) return 0;
  return Math.max(0, Math.round(((income - expense) / income) * 100));
}

export function getCurrentMonthStats(transactions) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const inRange = transactions.filter((t) => {
    const d = parseDate(t.date);
    return isWithinInterval(d, { start, end });
  });
  const income = inRange.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = inRange.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, savings: income - expense };
}

export function getBudgetStatus(transactions, budgets, categories) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const monthKey = format(now, "yyyy-MM");

  return budgets
    .filter((b) => b.month === monthKey)
    .map((b) => {
      const spent = transactions
        .filter((t) => {
          const d = parseDate(t.date);
          return (
            t.type === "expense" &&
            t.categoryId === b.categoryId &&
            isWithinInterval(d, { start, end })
          );
        })
        .reduce((s, t) => s + t.amount, 0);
      const cat = categories.find((c) => c.id === b.categoryId);
      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return { ...b, spent, percentage: pct, categoryName: cat?.name || "?", categoryColor: cat?.color || "#6366f1" };
    });
}

export function getSmartRecommendations(transactions, budgets, categories) {
  const tips = [];
  const trend = getMonthlyTrend(transactions, 3);
  const savingsRate = getSavingsRate(transactions);
  const top = getTopSpendingCategories(transactions, categories, 3);

  if (savingsRate < 10) {
    tips.push({ icon: "💡", text: "Tingkat tabungan Anda kurang dari 10%. Coba kurangi pengeluaran di kategori terbesar." });
  } else if (savingsRate >= 30) {
    tips.push({ icon: "🎉", text: `Luar biasa! Tingkat tabungan Anda ${savingsRate}% bulan ini. Pertahankan!` });
  }

  if (trend.length >= 2) {
    const lastExp = trend[trend.length - 1].expense;
    const prevExp = trend[trend.length - 2].expense;
    if (lastExp > prevExp * 1.2) {
      tips.push({ icon: "⚠️", text: "Pengeluaran bulan ini naik lebih dari 20% dibanding bulan lalu. Perlu perhatian." });
    }
  }

  if (top[0]) {
    tips.push({ icon: "📊", text: `Kategori "${top[0].label}" adalah pengeluaran terbesar Anda. Pertimbangkan untuk membuat anggaran spesifik.` });
  }

  const budgetStatus = getBudgetStatus(transactions, budgets, categories);
  const exceeded = budgetStatus.filter((b) => b.percentage > 100);
  exceeded.forEach((b) => {
    tips.push({ icon: "🚨", text: `Anggaran "${b.categoryName}" sudah melampaui batas ${b.percentage}%. Hati-hati!` });
  });

  const noBudget = categories.filter((c) => c.type === "expense" && !budgets.find((b) => b.categoryId === c.id));
  if (noBudget.length > 0) {
    tips.push({ icon: "📝", text: `Ada ${noBudget.length} kategori pengeluaran tanpa anggaran. Atur anggaran untuk kontrol lebih baik.` });
  }

  if (tips.length === 0) {
    tips.push({ icon: "✅", text: "Keuangan Anda tampak sehat! Terus catat setiap transaksi untuk insight yang lebih akurat." });
  }

  return tips;
}

export function getExpenseByCategory(transactions, categories) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const inRange = transactions.filter((t) => {
    const d = parseDate(t.date);
    return t.type === "expense" && isWithinInterval(d, { start, end });
  });
  const map = {};
  inRange.forEach((t) => {
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  });
  return Object.entries(map).map(([categoryId, total]) => ({
    categoryId,
    label: categories.find((c) => c.id === categoryId)?.name || "Lainnya",
    color: categories.find((c) => c.id === categoryId)?.color || "#6366f1",
    total,
  }));
}
