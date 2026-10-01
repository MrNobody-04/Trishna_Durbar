"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Filter,
  DollarSign,
  TrendingDown,
  Building,
  FileText,
  X,
} from "lucide-react";
import { formatNpr, formatNepalDateTime, TimePeriod } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  receiptUrl?: string;
  createdBy: { id: string; name: string };
}

const EXPENSE_CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "MEAT_PURCHASE", label: "🍗 Meat Purchase (Chicken/Mutton)" },
  { id: "GROCERIES", label: "🥕 Kitchen Groceries & Veggies" },
  { id: "GAS", label: "🔥 LPG Cooking Gas Cylinders" },
  { id: "ELECTRICITY", label: "⚡ NEA Electricity Bill" },
  { id: "WATER", label: "💧 Water Tanker Supply" },
  { id: "SALARY", label: "💼 Staff Salaries & Wages" },
  { id: "INTERNET", label: "🌐 Wi-Fi & Communications" },
  { id: "MAINTENANCE", label: "🔧 Maintenance & Repairs" },
  { id: "RENT", label: "🏢 Facility Rent" },
  { id: "OTHER", label: "📦 Miscellaneous" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");
  const [loading, setLoading] = useState(true);

  // Add Expense Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("MEAT_PURCHASE");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/expenses", window.location.origin);
      if (selectedCategory !== "ALL") url.searchParams.set("category", selectedCategory);
      if (selectedPeriod) url.searchParams.set("period", selectedPeriod);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load expenses");
      const data = await res.json();
      if (data?.expenses) {
        setExpenses(data.expenses);
        setTotalAmount(data.totalAmount || 0);
      }
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, selectedPeriod]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error("Please enter expense title and amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          amount: parseFloat(amount),
          category,
          paymentMethod,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create expense");

      toast.success("Expense recorded successfully!");
      setModalOpen(false);
      setTitle("");
      setAmount("");
      setNotes("");
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message || "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenseToDelete(id);
  };

  const executeDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/expenses/${expenseToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete expense");

      toast.success("Expense record removed");
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete));
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Financial Outflows & Accounting
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground mt-2">
            Hotel & Restaurant Expenses
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track daily kitchen purchases, utility bills, LPG gas, salaries, and facility rent.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Total Outflow ({selectedPeriod})
          </p>
          <p className="text-2xl font-black text-red-500 mt-1 font-mono">
            {formatNpr(totalAmount)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Expense Records
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1 font-mono">
            {expenses.length} <span className="text-xs text-muted-foreground font-normal">entries</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Primary Cost Area
          </p>
          <p className="text-sm font-bold text-foreground mt-2 truncate">
            {selectedCategory === "ALL" ? "Meat & Kitchen Groceries" : selectedCategory}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-secondary/40 dark:bg-black/60 border border-border dark:border-white/10">
        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-amber-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Period Buttons */}
        <div className="flex items-center gap-1 bg-card dark:bg-[#0d0d0d] p-1 rounded-xl border border-border dark:border-white/10 overflow-x-auto">
          {(["today", "week", "month", "all"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                selectedPeriod === p
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-[#0d0d0d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-secondary/70 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border dark:border-white/10">
              <tr>
                <th className="px-4 py-3">Expense Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Date (NST)</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-white/5">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-secondary/40 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{exp.title}</p>
                    {exp.notes && (
                      <p className="text-[11px] text-muted-foreground italic mt-0.5">{exp.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-muted-foreground">
                    {exp.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                    {formatNepalDateTime(exp.date)}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-amber-600 dark:text-amber-300 font-mono text-sm">
                    {formatNpr(exp.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No expense records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10">
              <h3 className="text-base font-black text-foreground">Record Operational Expense</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Expense Title / Payee *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Chicken supply (Ram Butcher)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Amount (Rs) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none"
                  >
                    <option value="MEAT_PURCHASE">Meat Purchase</option>
                    <option value="GROCERIES">Kitchen Groceries</option>
                    <option value="GAS">LPG Gas Cylinders</option>
                    <option value="ELECTRICITY">NEA Electricity</option>
                    <option value="WATER">Water Supply</option>
                    <option value="SALARY">Staff Salary</option>
                    <option value="INTERNET">Wi-Fi & Telecom</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RENT">Rent</option>
                    <option value="OTHER">Other Outflow</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none"
                >
                  <option value="CASH">Cash (नगद)</option>
                  <option value="QR_PAYMENT">Fonepay / QR</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Receipt number, invoice details, quantity notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20"
                >
                  {submitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Standard Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        title="Delete Expense Record?"
        message="Are you sure you want to delete this expense record? This will adjust your total restaurant expenditure totals."
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
}
