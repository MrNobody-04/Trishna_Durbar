"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Receipt,
  Plus,
  Minus,
  Trash2,
  Printer,
  QrCode,
  Banknote,
  CheckCircle2,
  Percent,
  Edit3,
  Check,
  Tag,
  CreditCard,
  Building2,
  Sparkles,
} from "lucide-react";
import { DiningTableData, ActiveOrderData } from "@/types";
import { formatNpr, formatNepalDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface LiveBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTableData | null;
  onRefresh: () => void;
  onOpenAddItems: (table: DiningTableData) => void;
  onPrintBill: (table: DiningTableData) => void;
  onPrintKot: (table: DiningTableData) => void;
  onShowQr: () => void;
}

export function LiveBillModal({
  isOpen,
  onClose,
  table,
  onRefresh,
  onOpenAddItems,
  onPrintBill,
  onPrintKot,
  onShowQr,
}: LiveBillModalProps) {
  const [localOrder, setLocalOrder] = useState<ActiveOrderData | null>(
    table?.activeOrder || null
  );

  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [tenderedAmount, setTenderedAmount] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [settling, setSettling] = useState(false);

  // Discount Inputs
  const [discountPercentInput, setDiscountPercentInput] = useState<string>("");
  const [discountRupeesInput, setDiscountRupeesInput] = useState<string>("");

  // Inline Item Price Edit: itemId -> price string
  const [editingItemPrices, setEditingItemPrices] = useState<Record<string, string>>({});
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Synchronize local order whenever table prop changes
  useEffect(() => {
    if (table?.activeOrder) {
      setLocalOrder(table.activeOrder);
      const o = table.activeOrder;
      if (o.discount > 0 && o.subtotal > 0) {
        const pct = ((o.discount / o.subtotal) * 100).toFixed(1);
        setDiscountPercentInput(pct.endsWith(".0") ? pct.slice(0, -2) : pct);
        setDiscountRupeesInput(o.discount.toString());
      } else {
        setDiscountPercentInput("");
        setDiscountRupeesInput("");
      }

      const initialPrices: Record<string, string> = {};
      o.items?.forEach((it) => {
        if (it.id) initialPrices[it.id] = it.unitPrice.toString();
      });
      setEditingItemPrices(initialPrices);
    }
  }, [
    table?.activeOrder?.id,
    table?.activeOrder?.subtotal,
    table?.activeOrder?.discount,
    table?.activeOrder?.totalAmount,
    table?.activeOrder?.paidAmount,
    table?.activeOrder?.items?.length,
  ]);

  if (!isOpen || !table || !table.activeOrder) return null;

  const currentOrder = localOrder || table.activeOrder;

  // Real-time dynamic financial calculation
  const subtotal = currentOrder.subtotal || 0;
  let activeDiscount = 0;
  if (discountRupeesInput !== "") {
    activeDiscount = parseFloat(discountRupeesInput) || 0;
  } else if (discountPercentInput !== "") {
    const pct = parseFloat(discountPercentInput) || 0;
    activeDiscount = (subtotal * pct) / 100;
  } else {
    activeDiscount = currentOrder.discount || 0;
  }
  activeDiscount = Math.min(subtotal, Math.max(0, activeDiscount));

  const liveGrandTotal = Math.max(0, subtotal - activeDiscount);
  const paidAmount = currentOrder.paidAmount || 0;
  const balanceRemaining = Math.max(0, liveGrandTotal - paidAmount);

  // Cash change return
  const tendered = parseFloat(tenderedAmount) || 0;
  const payAmt = parseFloat(paymentAmount) || 0;
  const changeReturn = tendered > payAmt ? tendered - payAmt : 0;

  // 1. DISCOUNT PERCENTAGE CHANGE
  const handleDiscountPercentChange = async (val: string) => {
    setDiscountPercentInput(val);
    const pct = parseFloat(val);
    if (!isNaN(pct) && pct >= 0 && pct <= 100) {
      const computedRupees = (subtotal * pct) / 100;
      setDiscountRupeesInput(computedRupees > 0 ? computedRupees.toFixed(0) : "");
      
      try {
        const res = await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountPercent: pct }),
        });
        const data = await res.json();
        if (data?.order) setLocalOrder(data.order);
        onRefresh();
      } catch {}
    } else if (val === "") {
      setDiscountRupeesInput("");
      try {
        const res = await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount: 0, discountPercent: 0 }),
        });
        const data = await res.json();
        if (data?.order) setLocalOrder(data.order);
        onRefresh();
      } catch {}
    }
  };

  // 2. FIXED RUPEES DISCOUNT CHANGE
  const handleDiscountRupeesChange = async (val: string) => {
    setDiscountRupeesInput(val);
    const disc = parseFloat(val);
    if (!isNaN(disc) && disc >= 0) {
      const pct = subtotal > 0 ? ((disc / subtotal) * 100).toFixed(1) : "0";
      setDiscountPercentInput(pct.endsWith(".0") ? pct.slice(0, -2) : pct);

      try {
        const res = await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount: disc }),
        });
        const data = await res.json();
        if (data?.order) setLocalOrder(data.order);
        onRefresh();
      } catch {}
    } else if (val === "") {
      setDiscountPercentInput("");
      try {
        const res = await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount: 0, discountPercent: 0 }),
        });
        const data = await res.json();
        if (data?.order) setLocalOrder(data.order);
        onRefresh();
      } catch {}
    }
  };

  // 3. PRESET DISCOUNT BUTTONS
  const applyPreset = (pct: number) => {
    handleDiscountPercentChange(pct > 0 ? pct.toString() : "");
  };

  // 4. INLINE DISH PRICE SAVE
  const handleSaveItemPrice = async (itemId: string) => {
    const rawVal = editingItemPrices[itemId];
    const newPrice = parseFloat(rawVal);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    setUpdatingItemId(itemId);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, unitPrice: newPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update item price");

      if (data?.order) setLocalOrder(data.order);
      toast.success("Dish unit price updated!");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update price");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 5. INLINE QUANTITY STEPPER (+ / -)
  const handleStepQuantity = async (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdatingItemId(itemId);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update quantity");

      if (data?.order) setLocalOrder(data.order);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 6. REMOVE DISH FROM ORDER
  const handleRemoveItem = async (itemId?: string) => {
    if (!itemId) return;
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove item");

      if (data?.order) setLocalOrder(data.order);
      toast.success("Dish removed from bill");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove dish");
    }
  };

  // 7. RECORD PAYMENT
  const handleRecordPayment = async () => {
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          method: paymentMethod,
          tendered: tendered > 0 ? tendered : null,
          notes: paymentNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      if (data?.order) setLocalOrder(data.order);
      toast.success(`Payment of ${formatNpr(amt)} recorded!`);
      setPaymentAmount("");
      setTenderedAmount("");
      setPaymentNotes("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // 8. SETTLE & VACATE TABLE
  const handleSettleAndRelease = async () => {
    if (balanceRemaining > 0.01) {
      toast.error(
        `Cannot settle table with unpaid balance of ${formatNpr(
          balanceRemaining
        )}. Please record payment first.`
      );
      return;
    }

    setSettling(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/settle`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to settle table");

      toast.success(`${table.name} settled and released!`);
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Settlement failed");
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[94vh] flex flex-col rounded-none sm:rounded-3xl bg-card dark:bg-[#080808] border-0 sm:border border-border dark:border-white/10 text-foreground shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border dark:border-white/10 bg-secondary/50 dark:bg-[#0c0c0c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-wide">
                  Live Bill — {table.name}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold uppercase">
                  {table.floor}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Guest: <span className="font-semibold text-foreground">{currentOrder.customerName || "Walk-in Guest"}</span> • Opened {formatNepalDateTime(currentOrder.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* ========================================================================= */}
          {/* LEFT: Ordered Dishes (7 cols) */}
          {/* ========================================================================= */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Ordered Dishes ({currentOrder.items?.length || 0})
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenAddItems(table)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-xs"
              >
                <Plus className="h-3 w-3" /> Add Dishes
              </button>
            </div>

            {/* Dishes List */}
            <div className="rounded-2xl border border-border dark:border-white/10 bg-secondary/20 dark:bg-[#0c0c0c] overflow-hidden">
              <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-border dark:divide-white/5">
                {currentOrder.items?.map((item: any, idx: number) => {
                  const itemId = item.id || `item-${idx}`;
                  const priceVal = editingItemPrices[itemId] ?? item.unitPrice.toString();
                  const isPriceChanged = parseFloat(priceVal) !== item.unitPrice;

                  return (
                    <div
                      key={itemId}
                      className="p-2.5 sm:p-3 flex items-center justify-between gap-2 hover:bg-secondary/40 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Dish Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-foreground text-xs sm:text-sm truncate">
                            {item.name}
                          </p>
                          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30 uppercase shrink-0">
                            {item.portion || "REGULAR"}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 italic truncate mt-0.5">
                            &quot;{item.notes}&quot;
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Rs. {item.unitPrice} × {item.quantity} ={" "}
                          <span className="font-bold font-mono text-foreground">
                            {formatNpr(item.total)}
                          </span>
                        </p>
                      </div>

                      {/* Quantity Stepper & Price Edit */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Stepper */}
                        <div className="flex items-center rounded-lg border border-border dark:border-white/15 bg-background dark:bg-black p-0.5">
                          <button
                            type="button"
                            onClick={() => handleStepQuantity(itemId, item.quantity, -1)}
                            disabled={updatingItemId === itemId}
                            className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-secondary transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStepQuantity(itemId, item.quantity, 1)}
                            disabled={updatingItemId === itemId}
                            className="p-1 rounded text-muted-foreground hover:text-emerald-500 hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Inline Price Edit */}
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={priceVal}
                            onChange={(e) =>
                              setEditingItemPrices({
                                ...editingItemPrices,
                                [itemId]: e.target.value,
                              })
                            }
                            onBlur={() => {
                              if (isPriceChanged && item.id) handleSaveItemPrice(item.id);
                            }}
                            className={`w-14 px-1 py-1 text-center font-mono font-bold text-xs rounded-lg border bg-background dark:bg-black transition-colors focus:outline-none ${
                              isPriceChanged
                                ? "border-amber-500 text-amber-600 ring-1 ring-amber-500/50"
                                : "border-border dark:border-white/10 text-foreground"
                            }`}
                          />
                          {isPriceChanged && item.id && (
                            <button
                              type="button"
                              onClick={() => handleSaveItemPrice(item.id!)}
                              className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(!currentOrder.items || currentOrder.items.length === 0) && (
                  <div className="py-10 text-center text-muted-foreground text-xs">
                    No dishes added yet. Click &quot;Add Dishes&quot; above.
                  </div>
                )}
              </div>
            </div>

            {/* Bill Subtotal */}
            <div className="p-3 rounded-2xl bg-card dark:bg-[#0c0c0c] border border-border dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Order Subtotal:</span>
              <span className="text-base font-black font-mono text-foreground">
                {formatNpr(subtotal)}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Financial Breakdown & Settlement (5 cols) */}
          {/* ========================================================================= */}
          <div className="md:col-span-5 flex flex-col space-y-3.5">
            
            {/* 🏷️ Discount & Grand Total Card */}
            <div className="p-4 rounded-2xl bg-card dark:bg-[#0c0c0c] border border-border dark:border-white/10 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Discount & Adjustments
                </span>
                {activeDiscount > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Saved: -{formatNpr(activeDiscount)}
                  </span>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground mr-0.5">Quick:</span>
                {[0, 5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPreset(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      discountPercentInput === pct.toString() && pct > 0
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                        : pct === 0 && activeDiscount === 0
                        ? "bg-secondary text-foreground border-border"
                        : "bg-background dark:bg-black text-muted-foreground border-border dark:border-white/10 hover:border-amber-400"
                    }`}
                  >
                    {pct === 0 ? "None (0%)" : `${pct}%`}
                  </button>
                ))}
              </div>

              {/* Discount Amount Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Discount in Rupees (Rs)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={subtotal}
                      placeholder="0"
                      value={discountRupeesInput}
                      onChange={(e) => handleDiscountRupeesChange(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-muted-foreground">Rs</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Discount in Percent (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="0"
                      value={discountPercentInput}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* 🌟 FINAL GRAND TOTAL (Prominent Royal Banner) */}
              <div className="pt-3 border-t border-border dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-foreground block">
                    Final Grand Total
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {activeDiscount > 0 ? `Subtotal ${formatNpr(subtotal)} - Discount ${formatNpr(activeDiscount)}` : "Live net amount to collect"}
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-500">
                  {formatNpr(liveGrandTotal)}
                </span>
              </div>
            </div>

            {/* 💳 Payment & Balance Card */}
            <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-[#0c0c0c] border border-border dark:border-white/10 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Total Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatNpr(paidAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-border dark:border-white/10">
                <span className="font-black text-foreground">Remaining Due:</span>
                <span
                  className={`text-xl font-black font-mono ${
                    balanceRemaining <= 0.01 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {formatNpr(balanceRemaining)}
                </span>
              </div>

              {balanceRemaining > 0.01 ? (
                <div className="space-y-2.5 pt-2">
                  {/* One-Tap Quick Fill Remaining */}
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(balanceRemaining.toString())}
                    className="w-full py-2 rounded-xl text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Pay Full Remaining Due ({formatNpr(balanceRemaining)})</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                        Amount to Pay (Rs)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-bold text-foreground focus:outline-none focus:border-amber-400"
                      >
                        <option value="CASH">💵 Cash (नगद)</option>
                        <option value="QR_PAYMENT">📱 Fonepay / QR</option>
                        <option value="CARD">💳 POS Card</option>
                        <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  {paymentMethod === "CASH" && (
                    <div className="p-2.5 rounded-xl bg-card dark:bg-black border border-border dark:border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Cash Tendered:</span>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={tenderedAmount}
                          onChange={(e) => setTenderedAmount(e.target.value)}
                          className="w-24 px-2 py-1 rounded-lg bg-background dark:bg-[#141414] border border-border dark:border-white/15 text-right font-mono font-bold text-xs text-foreground focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      {changeReturn > 0 && (
                        <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-border dark:border-white/10">
                          <span className="text-amber-600 dark:text-amber-400">Change Return:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                            {formatNpr(changeReturn)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "QR_PAYMENT" && (
                    <button
                      type="button"
                      onClick={onShowQr}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-xs font-bold text-amber-700 dark:text-amber-300 transition-colors"
                    >
                      <QrCode className="h-4 w-4" />
                      Display Restaurant Fonepay QR
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={submittingPayment}
                    onClick={handleRecordPayment}
                    className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.99]"
                  >
                    {submittingPayment ? "Recording Payment..." : "Record Payment Transaction"}
                  </button>
                </div>
              ) : (
                <div className="py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Fully Paid! Zero Unpaid Balance.
                  </p>
                </div>
              )}
            </div>

            {/* Print & Vacate Actions */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPrintKot(table)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary dark:bg-white/5 hover:bg-secondary/80 text-xs font-bold text-foreground border border-border dark:border-white/10 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-500" />
                  Print KOT
                </button>

                <button
                  type="button"
                  onClick={() => onPrintBill(table)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-500" />
                  Print Bill
                </button>
              </div>

              <button
                type="button"
                disabled={balanceRemaining > 0.01 || settling}
                onClick={handleSettleAndRelease}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99]"
              >
                {settling ? "Settling Table..." : `Settle & Vacate ${table.name}`}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
