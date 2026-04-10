import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

export function formatCurrency(amount, compact = false) {
  if (amount === null || amount === undefined) return "Rp 0";
  if (compact && Math.abs(amount) >= 1_000_000) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(amount);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  if (!isValid(d)) return "";
  return format(d, "dd MMM yyyy", { locale: id });
}

export function formatDateInput(date) {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

export function formatRelative(date) {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

export function formatMonth(date) {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  if (!isValid(d)) return "";
  return format(d, "MMM yyyy", { locale: id });
}

export function getMonthKey(date) {
  const d = date ? new Date(date) : new Date();
  return format(d, "yyyy-MM");
}
