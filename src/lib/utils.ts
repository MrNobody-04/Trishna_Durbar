import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FloorArea, MenuCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNpr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rs. 0";
  }
  return `Rs. ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

export function formatNepalDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d && !isNaN(d.getTime()) ? d.toLocaleString() : "-";
    } catch {
      return "-";
    }
  }
}

export function formatNepalTimeOnly(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d && !isNaN(d.getTime())
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-";
    } catch {
      return "-";
    }
  }
}

export function getFloorLabel(floor: FloorArea | string): string {
  switch (floor) {
    case "GROUND":
      return "Ground Floor (टेबल ७, ८, ९)";
    case "HALL":
      return "Main Hall (टेबल १, २, ३)";
    case "FIRST_FLOOR":
      return "First Floor (टेबल ४)";
    case "ROOFTOP":
      return "Rooftop (टेबल ५, ६)";
    default:
      return floor;
  }
}

export function getCategoryBadge(category: MenuCategory | string): { label: string; color: string } {
  switch (category) {
    case "CHICKEN":
      return { label: "चिकन (Chicken)", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    case "MUTTON":
      return { label: "मटन (Mutton)", color: "bg-red-500/20 text-red-300 border-red-500/40" };
    case "VEG":
      return { label: "भेज (Veg)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    case "COMBO":
      return { label: "कम्बो (Combo)", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
    case "RICE":
      return { label: "राइस (Rice)", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" };
    case "MOMO":
      return { label: "म:म: (Momo)", color: "bg-orange-500/20 text-orange-300 border-orange-500/40" };
    case "SNACKS":
      return { label: "नास्ता (Snacks)", color: "bg-teal-500/20 text-teal-300 border-teal-500/40" };
    case "BEVERAGE":
      return { label: "Soft पेय (Drinks)", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
    default:
      return { label: category, color: "bg-slate-500/20 text-slate-300 border-slate-500/40" };
  }
}

export type TimePeriod = "today" | "week" | "month" | "all";

export function getNepalDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  // Approximate offset for Asia/Kathmandu (UTC+5:45)
  const offsetMs = 5.75 * 60 * 60 * 1000;
  const nptNow = new Date(now.getTime() + offsetMs);

  const start = new Date(nptNow);
  const end = new Date(nptNow);

  if (period === "today") {
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
  } else if (period === "week") {
    const day = start.getUTCDay();
    const diff = start.getUTCDate() - day + (day === 0 ? -6 : 1);
    start.setUTCDate(diff);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
  } else if (period === "month") {
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
  } else {
    start.setTime(0);
    end.setUTCHours(23, 59, 59, 999);
  }

  // Adjust back from NPT to UTC
  return {
    start: new Date(start.getTime() - offsetMs),
    end: new Date(end.getTime() - offsetMs),
  };
}

export function formatOrderNumber(order?: {
  id?: string;
  orderNumber?: number | null;
  createdAt?: Date | string;
} | null): string {
  if (!order) return "2026-01";
  const d = order.createdAt ? new Date(order.createdAt) : new Date();
  const year = !isNaN(d.getTime()) ? d.getFullYear() : 2026;

  if (typeof order.orderNumber === "number" && order.orderNumber > 0) {
    return `${year}-${String(order.orderNumber).padStart(2, "0")}`;
  }

  // Fallback if orderNumber was not set yet: derive sequential 2-digit index or default to 01
  if (order.id) {
    const digits = order.id.replace(/\D/g, "");
    if (digits.length >= 2) {
      const parsed = parseInt(digits.slice(-2), 10);
      if (parsed > 0) return `${year}-${String(parsed).padStart(2, "0")}`;
    }
  }

  return `${year}-01`;
}

