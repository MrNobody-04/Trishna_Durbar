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
  Save,
  Tag,
  Calculator,
} from "lucide-react";
import { DiningTableData } from "@/types";
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
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [tenderedAmount, setTenderedAmount] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [settling, setSettling] = useState(false);

  // Discount & Overall Bill Edit State
  const [discountPercentInput, setDiscountPercentInput] = useState<string>("");
  const [discountRupeesInput, setDiscountRupeesInput] = useState<string>("");
  const [overrideGrandTotalInput, setOverrideGrandTotalInput] = useState<string>("");
  const [updatingPricing, setUpdatingPricing] = useState(false);

  // Inline Item Editing State: map of itemId -> { editingPrice: boolean, priceValue: string }
  const [editingItemPrices, setEditingItemPrices] = useState<Record<string, string>>({});
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const order = table?.activeOrder;

  // Sync inputs with current order state whenever order changes
  useEffect(() => {
    if (order) {
      if (order.discount > 0 && order.subtotal > 0) {
        const pct = ((order.discount / order.subtotal) * 100).toFixed(1);
        setDiscountPercentInput(pct.endsWith(".0") ? pct.slice(0, -2) : pct);
        setDiscountRupeesInput(order.discount.toString());
      } else {
        setDiscountPercentInput("");
        setDiscountRupeesInput("");
      }
      setOverrideGrandTotalInput(order.totalAmount.toString());

      // Initialize item price edit values
      const initialPrices: Record<string, string> = {};
      order.items?.forEach((it) => {
        if (it.id) initialPrices[it.id] = it.unitPrice.toString();
      });
      setEditingItemPrices(initialPrices);
    }
  }, [order?.id, order?.subtotal, order?.discount, order?.totalAmount]);

  if (!isOpen || !table || !table.activeOrder) return null;

  const currentOrder = table.activeOrder;
  const balanceRemaining = Math.max(
    0,
    currentOrder.totalAmount - currentOrder.paidAmount
  );

  // Calculate change return
  const tendered = parseFloat(tenderedAmount) || 0;
  const payAmt = parseFloat(paymentAmount) || 0;
  const changeReturn = tendered > payAmt ? tendered - payAmt : 0;

  // 1. DISCOUNT PERCENTAGE CHANGE HANDLER (Live updates bill immediately)
  const handleDiscountPercentChange = async (val: string) => {
    setDiscountPercentInput(val);
    const pct = parseFloat(val);
    if (!isNaN(pct) && pct >= 0 && pct <= 100) {
      const computedRupees = (currentOrder.subtotal * pct) / 100;
      setDiscountRupeesInput(computedRupees.toFixed(0));
      setOverrideGrandTotalInput(
        Math.max(0, currentOrder.subtotal - computedRupees).toFixed(0)
      );

      // Save to server
      try {
        await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountPercent: pct }),
        });
        onRefresh();
      } catch {}
    } else if (val === "") {
      setDiscountRupeesInput("");
      setOverrideGrandTotalInput(currentOrder.subtotal.toString());
      try {
        await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount: 0, discountPercent: 0 }),
        });
        onRefresh();
      } catch {}
    }
  };

  // 2. FIXED DISCOUNT RUPEES CHANGE HANDLER (Live updates bill immediately)
  const handleDiscountRupeesChange = async (val: string) => {
    setDiscountRupeesInput(val);
    const disc = parseFloat(val);
    if (!isNaN(disc) && disc >= 0) {
      const pct =
        currentOrder.subtotal > 0
          ? ((disc / currentOrder.subtotal) * 100).toFixed(1)
          : "0";
      setDiscountPercentInput(pct.endsWith(".0") ? pct.slice(0, -2) : pct);
      setOverrideGrandTotalInput(
        Math.max(0, currentOrder.subtotal - disc).toFixed(0)
      );

      try {
        await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount: disc }),
        });
        onRefresh();
      } catch {}
    } else if (val === "") {
      setDiscountPercentInput("");
      setOverrideGrandTotalInput(currentOrder.subtotal.toString());
      try {
        await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount: 0, discountPercent: 0 }),
        });
        onRefresh();
      } catch {}
    }
  };

  // 3. DIRECT OVERALL BILL OVERRIDE (e.g. bargain or round off bill)
  const handleOverrideGrandTotalChange = async (val: string) => {
    setOverrideGrandTotalInput(val);
    const targetTotal = parseFloat(val);
    if (!isNaN(targetTotal) && targetTotal >= 0) {
      const computedDiscount = Math.max(0, currentOrder.subtotal - targetTotal);
      setDiscountRupeesInput(computedDiscount.toFixed(0));
      const pct =
        currentOrder.subtotal > 0
          ? ((computedDiscount / currentOrder.subtotal) * 100).toFixed(1)
          : "0";
      setDiscountPercentInput(pct.endsWith(".0") ? pct.slice(0, -2) : pct);

      try {
        await fetch(`/api/orders/${currentOrder.id}/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideTotal: targetTotal }),
        });
        onRefresh();
      } catch {}
    }
  };

  // Quick Preset Discounts
  const applyPresetDiscount = async (pct: number) => {
    handleDiscountPercentChange(pct.toString());
  };

  // 4. INLINE ITEM UNIT PRICE UPDATE
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

      toast.success("Item price updated!");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update price");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 5. INLINE ITEM QUANTITY STEPPERS (+ / -)
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

      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 6. REMOVE ITEM FROM ORDER
  const handleRemoveItem = async (itemId?: string) => {
    if (!itemId) return;
    try {
      const res = await fetch(
        `/api/orders/${currentOrder.id}/items?itemId=${itemId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove item");

      toast.success("Item removed from order");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item");
    }
  };

  // 7. RECORD PAYMENT TRANSACTION
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

      toast.success(`${table.name} has been settled and released to Available!`);
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-wide truncate">
                  Live Bill — {table.name}
                </h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/35 font-bold">
                  {table.floor}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Guest: <span className="text-foreground font-semibold">{currentOrder.customerName}</span> • Opened: {formatNepalDateTime(currentOrder.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Left: Itemized Bill with INLINE PRICE & QUANTITY EDITING (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" /> Ordered Dishes ({currentOrder.items?.length || 0})
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Click unit price to edit dish price live
                  </span>
                </div>
                <button
                  onClick={() => onOpenAddItems(table)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-xs"
                >
                  <Plus className="h-3 w-3" /> Add Dishes
                </button>
              </div>

              {/* Items List Table */}
              <div className="rounded-2xl border border-border dark:border-white/10 bg-secondary/30 dark:bg-[#0d0d0d] divide-y divide-border dark:divide-white/5 overflow-hidden shadow-xs">
                <div className="grid grid-cols-12 px-3 py-2 text-[10px] sm:text-[11px] font-bold text-muted-foreground bg-secondary/60 dark:bg-white/5 uppercase">
                  <span className="col-span-5">Dish</span>
                  <span className="col-span-3 text-center">Unit Rs</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-border dark:divide-white/5">
                  {currentOrder.items?.map((item, idx) => {
                    const itemId = item.id || `item-${idx}`;
                    const priceVal = editingItemPrices[itemId] ?? item.unitPrice.toString();
                    const isChanged = parseFloat(priceVal) !== item.unitPrice;
                    return (
                      <div
                        key={itemId}
                        className="grid grid-cols-12 px-2.5 sm:px-3 py-2.5 text-xs items-center hover:bg-secondary/40 dark:hover:bg-white/[0.03] transition-colors gap-1"
                      >
                        {/* Item Name */}
                        <div className="col-span-5 overflow-hidden">
                          <p className="font-bold text-foreground truncate text-xs">{item.name}</p>
                          {item.notes && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic truncate">
                              &quot;{item.notes}&quot;
                            </p>
                          )}
                          <span className="text-[9px] text-muted-foreground uppercase">
                            {item.category}
                          </span>
                        </div>

                        {/* Inline Editable Unit Price */}
                        <div className="col-span-3 flex items-center justify-center gap-1">
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
                              if (isChanged && item.id) handleSaveItemPrice(item.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && item.id) handleSaveItemPrice(item.id);
                            }}
                            className={`w-14 sm:w-16 px-1 py-1 text-center font-bold text-xs rounded-lg border bg-background dark:bg-black transition-colors focus:outline-none ${
                              isChanged
                                ? "border-amber-500 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50"
                                : "border-border dark:border-white/10 text-foreground focus:border-amber-400"
                            }`}
                          />
                          {isChanged && item.id && (
                            <button
                              onClick={() => handleSaveItemPrice(item.id!)}
                              disabled={updatingItemId === item.id}
                              className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 shrink-0"
                              title="Save new price"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {/* Quantity Stepper (- and +) */}
                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              if (item.id) handleStepQuantity(item.id, item.quantity, -1);
                            }}
                            disabled={updatingItemId === item.id}
                            className="h-6 w-6 flex items-center justify-center rounded-lg bg-secondary dark:bg-white/5 hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border dark:border-white/10 transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="w-4 text-center font-bold text-foreground text-xs">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => {
                              if (item.id) handleStepQuantity(item.id, item.quantity, 1);
                            }}
                            disabled={updatingItemId === item.id}
                            className="h-6 w-6 flex items-center justify-center rounded-lg bg-secondary dark:bg-white/5 hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border dark:border-white/10 transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Item Total & Delete */}
                        <div className="col-span-2 flex items-center justify-end gap-1.5 text-right">
                          <span className="font-extrabold text-amber-600 dark:text-amber-300 font-mono text-xs">
                            {formatNpr(item.total)}
                          </span>
                          <button
                            onClick={() => {
                              if (item.id) handleRemoveItem(item.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Remove dish"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!currentOrder.items || currentOrder.items.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      No dishes on this order yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtotal, Live Discount & Overall Bill Editing */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10 space-y-3 shadow-md">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {formatNpr(currentOrder.subtotal)}
                </span>
              </div>

              {/* LIVE DISCOUNT & OVERALL BILL ADJUSTMENT SECTION */}
              <div className="p-3 rounded-xl bg-secondary/40 dark:bg-white/[0.03] border border-border dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Tag className="h-3.5 w-3.5" /> Discount & Adjustments
                  </span>
                  {currentOrder.discount > 0 && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Saving: -{formatNpr(currentOrder.discount)}
                    </span>
                  )}
                </div>

                {/* Preset Percentage Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Presets:</span>
                  {[0, 5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPresetDiscount(pct)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        discountPercentInput === pct.toString()
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "bg-background dark:bg-black text-muted-foreground border-border dark:border-white/10 hover:border-amber-400"
                      }`}
                    >
                      {pct === 0 ? "None" : `${pct}%`}
                    </button>
                  ))}
                </div>

                {/* Dual Synchronized Inputs: Discount % and Discount Rs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        placeholder="0%"
                        value={discountPercentInput}
                        onChange={(e) => handleDiscountPercentChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Discount (Rs)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={discountRupeesInput}
                        onChange={(e) => handleDiscountRupeesChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-muted-foreground">Rs</span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Agreed Grand Total (Rs)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder={currentOrder.subtotal.toString()}
                        value={overrideGrandTotalInput}
                        onChange={(e) => handleOverrideGrandTotalChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-background dark:bg-black border border-amber-500/40 text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-amber-500/70">Rs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Total Display */}
              <div className="pt-2 border-t border-border dark:border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-foreground uppercase tracking-wider block">
                    Final Grand Total:
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Live bill for guest invoicing
                  </span>
                </div>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight drop-shadow-xs">
                  {formatNpr(currentOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Settlement & Printing (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-secondary/30 dark:bg-[#0d0d0d] p-4 sm:p-5 rounded-2xl border border-border dark:border-white/10 shadow-sm">
            {/* Balance Status Banner */}
            <div className="p-3.5 rounded-xl bg-card dark:bg-black border border-border dark:border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatNpr(currentOrder.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-border dark:border-white/10">
                <span className="font-bold text-foreground">Remaining Due:</span>
                <span
                  className={`text-xl font-black font-mono ${
                    balanceRemaining <= 0.01 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {formatNpr(balanceRemaining)}
                </span>
              </div>
            </div>

            {/* Payment Recording Form */}
            {balanceRemaining > 0.01 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="h-4 w-4" /> Record Guest Payment
                </h4>

                <button
                  onClick={() => setPaymentAmount(balanceRemaining.toString())}
                  className="w-full py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors"
                >
                  ⚡ Fill Remaining Due ({formatNpr(balanceRemaining)})
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Payment Amount (Rs)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-sm font-bold text-foreground focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                    >
                      <option value="CASH">Cash (नगद)</option>
                      <option value="QR_PAYMENT">Fonepay / QR</option>
                      <option value="CARD">Card / POS</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {paymentMethod === "CASH" && (
                  <div className="p-3 rounded-xl bg-card dark:bg-black border border-border dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Cash Tendered:</span>
                      <input
                        type="number"
                        placeholder="e.g. 1000"
                        value={tenderedAmount}
                        onChange={(e) => setTenderedAmount(e.target.value)}
                        className="w-28 px-2.5 py-1 rounded-lg bg-background dark:bg-[#141414] border border-border dark:border-white/15 text-right text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                      />
                    </div>
                    {changeReturn > 0 && (
                      <div className="flex items-center justify-between text-xs font-bold pt-1.5 border-t border-border dark:border-white/10">
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
                    onClick={onShowQr}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    Display Restaurant Fonepay QR Code
                  </button>
                )}

                <button
                  disabled={submittingPayment}
                  onClick={handleRecordPayment}
                  className="w-full py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                >
                  {submittingPayment ? "Recording Payment..." : "Record Payment Transaction"}
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1.5">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Fully Settled! Zero Unpaid Balance.
                </p>
                <p className="text-xs text-muted-foreground">
                  Ready to print guest bill and release table.
                </p>
              </div>
            )}

            {/* Print & Settlement Actions */}
            <div className="space-y-2 pt-3 border-t border-border dark:border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onPrintKot(table)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary dark:bg-white/5 hover:bg-secondary/80 text-xs font-bold text-foreground border border-border dark:border-white/10 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-500" />
                  Print KOT
                </button>

                <button
                  onClick={() => onPrintBill(table)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-500" />
                  Print Bill
                </button>
              </div>

              <button
                disabled={balanceRemaining > 0.01 || settling}
                onClick={handleSettleAndRelease}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01]"
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
