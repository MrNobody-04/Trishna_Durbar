"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  ShoppingBag,
  Layers,
  ChevronRight,
  CheckCircle2,
  Tag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { DiningTableData, OrderItemData, FloorArea } from "@/types";
import { formatNpr } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItemRecord {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: string;
  portion: string;
  price: number;
  description?: string;
  comboItems?: string;
  isAvailable: boolean;
}

interface CategoryRecord {
  id: string;
  name: string;
  label: string;
  icon?: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTableData | null;
  allTables?: DiningTableData[];
  onOrderSuccess: () => void;
  mode: "NEW" | "ADD_ITEMS";
}

const FLOOR_CATEGORIES: { id: FloorArea; label: string; sub: string; icon: string }[] = [
  { id: "GROUND", label: "Ground Floor", sub: "Tables 7, 8, 9", icon: "🌿" },
  { id: "HALL", label: "Main Hall", sub: "Tables 1, 2, 3", icon: "🏛️" },
  { id: "FIRST_FLOOR", label: "First Floor (VIP)", sub: "Table 4", icon: "👑" },
  { id: "ROOFTOP", label: "Rooftop Terrace", sub: "Tables 5, 6", icon: "🌅" },
];

export function OrderModal({
  isOpen,
  onClose,
  table,
  allTables = [],
  onOrderSuccess,
  mode,
}: OrderModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<FloorArea>("HALL");
  const [selectedTable, setSelectedTable] = useState<DiningTableData | null>(table);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [basket, setBasket] = useState<OrderItemData[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mobile Tab: 'MENU' | 'BASKET'
  const [mobileTab, setMobileTab] = useState<"MENU" | "BASKET">("MENU");

  useEffect(() => {
    if (isOpen) {
      // Fetch menu items
      fetch("/api/menu")
        .then((res) => res.json())
        .then((data) => {
          if (data?.items) setMenuItems(data.items);
        })
        .catch(() => toast.error("Failed to load menu items"));

      // Fetch dynamic categories
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data?.categories) setCategories(data.categories);
        })
        .catch(() => {});

      if (table) {
        setSelectedTable(table);
        setSelectedFloor(table.floor);
        setGuestCount(table.capacity || 2);
      } else if (allTables.length > 0) {
        setSelectedTable(allTables[0]);
        setSelectedFloor(allTables[0].floor);
      }
      setBasket([]);
      setCustomerName("");
      setCustomerPhone("");
      setOrderNotes("");
      setMobileTab("MENU");
    }
  }, [isOpen, table, allTables]);

  if (!isOpen) return null;

  // Filter tables by floor
  const floorTables = allTables.filter((t) => t.floor === selectedFloor);

  const filteredItems = menuItems.filter((item) => {
    if (!item.isAvailable) return false;
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.nameEnglish.toLowerCase().includes(q) ||
      item.nameNepali.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const addItemToBasket = (item: MenuItemRecord) => {
    const existingIndex = basket.findIndex(
      (b) => b.name === item.nameEnglish && b.unitPrice === item.price
    );

    if (existingIndex > -1) {
      const updated = [...basket];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setBasket(updated);
    } else {
      setBasket([
        ...basket,
        {
          name: item.nameEnglish,
          category: item.category,
          portion: item.portion,
          quantity: 1,
          unitPrice: item.price,
          total: item.price,
          notes: "",
        },
      ]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...basket];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
      updated[index].total = newQty * updated[index].unitPrice;
    }
    setBasket(updated);
  };

  const updateUnitPrice = (index: number, newPrice: number) => {
    const updated = [...basket];
    const cleanPrice = Math.max(0, newPrice);
    updated[index].unitPrice = cleanPrice;
    updated[index].total = cleanPrice * updated[index].quantity;
    setBasket(updated);
  };

  const removeItemFromBasket = (index: number) => {
    const updated = [...basket];
    updated.splice(index, 1);
    setBasket(updated);
  };

  const basketSubtotal = basket.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    const currentTable = selectedTable || table;
    if (!currentTable) {
      toast.error("Please select a table");
      return;
    }

    if (basket.length === 0) {
      toast.error("Please add at least one dish to order");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "NEW") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableId: currentTable.id,
            customerName: customerName.trim() || "Walk-in Guest",
            customerPhone: customerPhone.trim() || null,
            guestCount,
            notes: orderNotes.trim() || null,
            items: basket,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create order");

        toast.success(`Order created for ${currentTable.name}!`);
      } else {
        if (!currentTable.activeOrder?.id) throw new Error("No active order found");
        const res = await fetch(`/api/orders/${currentTable.activeOrder.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: basket }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add items");

        toast.success(`Added ${basket.length} dishes to ${currentTable.name}!`);
      }

      onOrderSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const activeTargetTable = selectedTable || table;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-full sm:h-[94vh] flex flex-col rounded-none sm:rounded-3xl bg-card dark:bg-[#080808] border-0 sm:border border-border dark:border-white/10 text-foreground shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Utensils className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-foreground truncate">
                  {mode === "NEW" ? "Take Order" : "Add Dishes"}
                  {activeTargetTable && ` — ${activeTargetTable.name}`}
                </h2>
                {activeTargetTable && (
                  <span className="hidden sm:inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {activeTargetTable.floor}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Touch dishes to add • Real-time unit price editing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 📱 MOBILE VIEW TAB SWITCHER (Visible ONLY on small mobile screens) */}
        <div className="flex md:hidden border-b border-border dark:border-white/10 bg-secondary/40 dark:bg-[#0a0a0a] p-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab("MENU")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mobileTab === "MENU"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>Dishes ({filteredItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("BASKET")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
              mobileTab === "BASKET"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Basket ({basket.length})</span>
            {basket.length > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full">
                {formatNpr(basketSubtotal)}
              </span>
            )}
          </button>
        </div>

        {/* 🌟 FLOOR & TABLE SELECTION STRIP (Compact & Responsive on all screens) */}
        <div className="px-3 sm:px-5 py-2.5 border-b border-border dark:border-white/10 bg-secondary/30 dark:bg-[#0c0c0c] shrink-0 space-y-2">
          {/* Floor tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1 whitespace-nowrap mr-1">
              <Layers className="h-3 w-3 text-amber-500" /> Floor:
            </span>
            {FLOOR_CATEGORIES.map((floor) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => {
                  setSelectedFloor(floor.id);
                  const firstOfFloor = allTables.find((t) => t.floor === floor.id);
                  if (firstOfFloor && mode === "NEW") setSelectedTable(firstOfFloor);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedFloor === floor.id
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-background dark:bg-black/60 border-border dark:border-white/10 text-foreground hover:bg-secondary dark:hover:bg-white/5"
                }`}
              >
                <span>{floor.icon}</span>
                <span>{floor.label}</span>
              </button>
            ))}
          </div>

          {/* Tables Row on selected floor */}
          {floorTables.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap mr-1">
                Select Table:
              </span>
              {floorTables.map((t) => {
                const isSelected = activeTargetTable?.id === t.id;
                const isOccupied = t.status === "OCCUPIED";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTable(t)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                        : isOccupied
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35"
                        : "bg-background dark:bg-black border-border dark:border-white/10 text-foreground hover:border-amber-400"
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] opacity-75">
                      ({isOccupied ? "Occupied" : "Free"})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Main Content Split: Left Menu (60%), Right Basket (40%) on desktop; Tab-toggled on mobile */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* ========================================================================= */}
          {/* LEFT: Menu Item Picker (Always visible on md+, toggled via mobileTab on mobile) */}
          {/* ========================================================================= */}
          <div
            className={`flex-1 flex flex-col border-r border-border dark:border-white/10 overflow-hidden bg-background dark:bg-[#080808] ${
              mobileTab === "MENU" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Search & Category Filter Header */}
            <div className="p-3 border-b border-border dark:border-white/10 space-y-2 bg-secondary/40 dark:bg-[#0c0c0c] shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dishes (e.g. Momo, Roast, Sadeko, Biryani)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Dynamic Menu Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === "ALL"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "bg-card dark:bg-black text-foreground hover:bg-secondary border border-border dark:border-white/10"
                  }`}
                >
                  🍽️ All ({menuItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.name
                        ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                        : "bg-card dark:bg-black text-foreground hover:bg-secondary border border-border dark:border-white/10"
                    }`}
                  >
                    <span>{cat.icon || "🍽️"}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Responsive Grid */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-20 md:pb-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addItemToBasket(item)}
                  className="group relative flex flex-col justify-between p-3 rounded-2xl bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10 hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.98]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.nameNepali}
                      </h4>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25 shrink-0">
                        {item.portion}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.nameEnglish}</p>
                    {item.comboItems && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                        <Sparkles className="h-2.5 w-2.5" /> Combo Pack
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border dark:border-white/10 flex items-center justify-between">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                      {formatNpr(item.price)}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 group-hover:bg-amber-300 shadow-xs transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                  No matching menu items found.
                </div>
              )}
            </div>

            {/* 📱 Mobile Floating Cart Bar (Sticky when items exist in basket) */}
            {basket.length > 0 && (
              <div className="md:hidden absolute bottom-2 inset-x-2 z-20">
                <button
                  type="button"
                  onClick={() => setMobileTab("BASKET")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black shadow-xl shadow-amber-500/30 animate-in slide-in-from-bottom-2 duration-150"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-sm">
                      {basket.length} {basket.length === 1 ? "Dish" : "Dishes"} Added
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-black">
                      {formatNpr(basketSubtotal)}
                    </span>
                    <span className="flex items-center gap-1 text-xs bg-slate-950 text-amber-400 px-2.5 py-1 rounded-xl">
                      Review <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Order Basket & Price Adjustments (Always on md+, toggled on mobile) */}
          {/* ========================================================================= */}
          <div
            className={`w-full md:w-96 flex flex-col bg-card dark:bg-[#0c0c0c] border-t md:border-t-0 border-border dark:border-white/10 overflow-hidden ${
              mobileTab === "BASKET" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Guest / Table Info (for new orders) */}
            {mode === "NEW" && (
              <div className="p-3 border-b border-border dark:border-white/10 bg-secondary/30 dark:bg-[#080808] space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      placeholder="Walk-in Guest"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Guest Count
                    </label>
                    <div className="flex items-center rounded-lg bg-background dark:bg-black border border-border dark:border-white/15 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="px-2.5 py-1.5 text-xs hover:bg-secondary font-bold text-foreground"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-foreground">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(guestCount + 1)}
                        className="px-2.5 py-1.5 text-xs hover:bg-secondary font-bold text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basket Items Header */}
            <div className="px-4 py-2.5 bg-secondary/50 dark:bg-black border-b border-border dark:border-white/10 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                Current Basket ({basket.length} items)
              </span>
              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBasket([])}
                  className="text-[11px] text-red-500 hover:text-red-400 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Basket Items List with INLINE PRICE & QUANTITY EDITING */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {basket.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-secondary/40 dark:bg-black border border-border dark:border-white/10 space-y-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-bold text-foreground truncate">
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {item.category} • {item.portion}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                        {formatNpr(item.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItemFromBasket(idx)}
                        className="p-1 text-muted-foreground hover:text-red-500"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Price Edit & Quantity Stepper */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border dark:border-white/10 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">Unit Rs:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateUnitPrice(idx, parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-1.5 py-0.5 rounded bg-background dark:bg-[#141414] border border-border dark:border-white/15 text-xs text-center font-bold text-foreground focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1 bg-background dark:bg-[#141414] rounded-lg p-0.5 border border-border dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="p-1 hover:text-red-500 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="p-1 hover:text-emerald-500 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {basket.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-secondary dark:bg-white/5 flex items-center justify-center text-amber-500">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium">Your order basket is empty.</p>
                  <p className="text-[11px] text-muted-foreground">
                    Select dishes from the menu to build the ticket!
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileTab("MENU")}
                    className="md:hidden mt-2 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Browse Menu Dishes
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Area: Subtotal & Dispatch Button */}
            <div className="p-3.5 border-t border-border dark:border-white/10 bg-secondary/50 dark:bg-[#080808] space-y-2.5 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-wide">
                  Subtotal Amount:
                </span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                  {formatNpr(basketSubtotal)}
                </span>
              </div>

              <button
                type="button"
                disabled={basket.length === 0 || submitting}
                onClick={handleSubmit}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Dispatching to Kitchen...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {mode === "NEW" ? "Send to Kitchen" : "Add Dishes to Table"} ({formatNpr(basketSubtotal)})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
