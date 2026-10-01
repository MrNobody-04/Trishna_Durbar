"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Plus,
  Minus,
  Check,
  Search,
  Tag,
  DollarSign,
  UtensilsCrossed,
} from "lucide-react";
import { formatNpr } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: string;
  portion: string;
  price: number;
}

interface CreateComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: MenuItem[];
  onSuccess: () => void;
}

export function CreateComboModal({
  isOpen,
  onClose,
  availableItems,
  onSuccess,
}: CreateComboModalProps) {
  const [comboNameEnglish, setComboNameEnglish] = useState("");
  const [comboNameNepali, setComboNameNepali] = useState("");
  const [comboPortion, setComboPortion] = useState("SERVES 2-3");
  const [comboPrice, setComboPrice] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDishes, setSelectedDishes] = useState<
    { id: string; name: string; price: number; quantity: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDishSelection = (dish: MenuItem) => {
    const existing = selectedDishes.find((d) => d.id === dish.id);
    if (existing) {
      setSelectedDishes(selectedDishes.filter((d) => d.id !== dish.id));
    } else {
      setSelectedDishes([
        ...selectedDishes,
        { id: dish.id, name: dish.nameEnglish, price: dish.price, quantity: 1 },
      ]);
    }
  };

  const updateSelectedDishQty = (id: string, delta: number) => {
    setSelectedDishes(
      selectedDishes
        .map((d) => {
          if (d.id === id) {
            const newQty = d.quantity + delta;
            return newQty > 0 ? { ...d, quantity: newQty } : null;
          }
          return d;
        })
        .filter(Boolean) as any
    );
  };

  const regularSumTotal = selectedDishes.reduce(
    (sum, d) => sum + d.price * d.quantity,
    0
  );

  const offerPriceNum = parseFloat(comboPrice) || 0;
  const savings = regularSumTotal > offerPriceNum ? regularSumTotal - offerPriceNum : 0;
  const savingsPercent =
    regularSumTotal > 0 ? ((savings / regularSumTotal) * 100).toFixed(0) : "0";

  const handleCreateCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboNameEnglish.trim()) {
      toast.error("Please enter a Combo Offer Name");
      return;
    }

    if (selectedDishes.length === 0) {
      toast.error("Please select at least one dish included in this combo");
      return;
    }

    if (!offerPriceNum || offerPriceNum <= 0) {
      toast.error("Please set a valid Combo Offer Price");
      return;
    }

    setSubmitting(true);
    try {
      const dishSummary = selectedDishes.map(
        (d) => `${d.quantity > 1 ? `${d.quantity}x ` : ""}${d.name}`
      );

      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEnglish: comboNameEnglish.trim(),
          nameNepali: comboNameNepali.trim() || comboNameEnglish.trim(),
          category: "COMBO",
          portion: comboPortion.trim(),
          price: offerPriceNum,
          description:
            comboDescription.trim() ||
            `Special Feast Platter includes: ${dishSummary.join(" + ")}`,
          comboItems: dishSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create combo");

      toast.success(`Combo Offer "${comboNameEnglish}" created successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create combo offer");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAvailable = availableItems.filter((it) => {
    if (it.category === "COMBO") return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      it.nameEnglish.toLowerCase().includes(q) ||
      it.nameNepali.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-3xl bg-card dark:bg-[#080808] border-0 sm:border border-border dark:border-white/10 text-foreground shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground">
                Create Royal Combo & Feast Offer
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Bundle individual dishes together with a special discounted offer price
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Left: Combo Details Form (5 cols) */}
          <form
            id="combo-form"
            onSubmit={handleCreateCombo}
            className="md:col-span-5 space-y-3"
          >
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Combo Offer Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Durbar Feast Platter"
                value={comboNameEnglish}
                onChange={(e) => setComboNameEnglish(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Combo Offer Name (Nepali)
              </label>
              <input
                type="text"
                placeholder="e.g. शाही दरबार कम्बो प्लेटर"
                value={comboNameNepali}
                onChange={(e) => setComboNameNepali(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Portion / Serving
                </label>
                <select
                  value={comboPortion}
                  onChange={(e) => setComboPortion(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                >
                  <option value="SERVES 1-2">Serves 1-2 Persons</option>
                  <option value="SERVES 2-3">Serves 2-3 Persons</option>
                  <option value="FAMILY PACK">Family Pack (4+)</option>
                  <option value="FEAST">Grand Feast Platter</option>
                  <option value="SNACK PACK">Snack Combo</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Special Offer Price (Rs) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1199"
                  value={comboPrice}
                  onChange={(e) => setComboPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-amber-500/50 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Savings & Offer Calculation Banner */}
            <div className="p-3.5 rounded-2xl bg-secondary/40 dark:bg-[#0d0d0d] border border-border dark:border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Standard Items Total:</span>
                <span className="font-mono font-semibold line-through text-foreground/70">
                  {formatNpr(regularSumTotal)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>Combo Offer Price:</span>
                <span className="font-mono text-base font-black">
                  {formatNpr(offerPriceNum)}
                </span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center pt-1.5 border-t border-border dark:border-white/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Guest Saves:</span>
                  <span className="bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {formatNpr(savings)} ({savingsPercent}% OFF)
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Description / Highlight Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Includes fresh mint dip, salad and choice of soft drink"
                value={comboDescription}
                onChange={(e) => setComboDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
              />
            </div>
          </form>

          {/* Right: Select Dishes from Menu (7 cols) */}
          <div className="md:col-span-7 flex flex-col border border-border dark:border-white/10 rounded-2xl bg-secondary/30 dark:bg-[#0d0d0d] overflow-hidden">
            <div className="p-3 border-b border-border dark:border-white/10 space-y-2 bg-secondary/60 dark:bg-[#080808]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <UtensilsCrossed className="h-4 w-4 text-amber-500" />
                  Select Dishes for Combo ({selectedDishes.length} selected)
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter dishes by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Selected Dishes Pill Tags */}
            {selectedDishes.length > 0 && (
              <div className="p-2.5 bg-amber-500/10 border-b border-border dark:border-white/10 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedDishes.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-background dark:bg-black border border-amber-500/40 text-[11px] font-bold text-amber-600 dark:text-amber-400"
                  >
                    <span>
                      {d.quantity > 1 ? `${d.quantity}x ` : ""}
                      {d.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSelectedDishQty(d.id, 1)}
                      className="hover:text-emerald-500"
                      title="Add one more"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedDishQty(d.id, -1)}
                      className="hover:text-red-500"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dishes Selection Grid */}
            <div className="flex-1 overflow-y-auto p-3 max-h-80 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAvailable.map((dish) => {
                const isSelected = selectedDishes.some((d) => d.id === dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => toggleDishSelection(dish)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400 text-amber-700 dark:text-amber-300 shadow-xs"
                        : "bg-card dark:bg-black border-border dark:border-white/10 hover:border-amber-400 text-foreground"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{dish.nameEnglish}</p>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {dish.category} • {formatNpr(dish.price)}
                      </span>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center border text-xs ${
                        isSelected
                          ? "bg-amber-400 border-amber-400 text-slate-950 font-bold"
                          : "border-border dark:border-white/20"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border dark:border-white/10 text-xs text-muted-foreground hover:bg-secondary dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="combo-form"
            disabled={submitting || selectedDishes.length === 0}
            className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 disabled:opacity-40"
          >
            {submitting ? "Creating Offer..." : "Publish Combo Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
