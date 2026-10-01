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
  ChevronDown,
  ChevronUp,
  Check,
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

const getCategoryEmoji = (category: string) => {
  const c = category.toUpperCase();
  if (c.includes("CHICKEN")) return "🍗";
  if (c.includes("MUTTON")) return "🥩";
  if (c.includes("VEG")) return "🥗";
  if (c.includes("MOMO")) return "🥟";
  if (c.includes("RICE") || c.includes("BIRYANI")) return "🍚";
  if (c.includes("SNACK") || c.includes("BREAKFAST")) return "🥪";
  if (c.includes("DRINK") || c.includes("BEVERAGE") || c.includes("TEA") || c.includes("COFFEE")) return "☕";
  if (c.includes("COMBO") || c.includes("PLATTER")) return "🍱";
  if (c.includes("HOOKAH")) return "💨";
  return "🍽️";
};

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
  const [showTablePicker, setShowTablePicker] = useState(false);
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
      fetch("/api/menu")
        .then((res) => res.json())
        .then((data) => {
          if (data?.items) setMenuItems(data.items);
        })
        .catch(() => toast.error("Failed to load menu items"));

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
      setShowTablePicker(false);
    }
  }, [isOpen, table, allTables]);

  if (!isOpen) return null;

  const floorTables = allTables.filter((t) => t.floor === selectedFloor);
  const activeTargetTable = selectedTable || table;

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

  const getItemDisplayName = (item: MenuItemRecord) => {
    return item.nameNepali ? `${item.nameNepali} (${item.nameEnglish})` : item.nameEnglish;
  };

  const getItemQuantityInBasket = (item: MenuItemRecord) => {
    const displayName = getItemDisplayName(item);
    const found = basket.find(
      (b) => (b.name === displayName || b.name === item.nameEnglish) && b.unitPrice === item.price
    );
    return found ? found.quantity : 0;
  };

  const addItemToBasket = (item: MenuItemRecord) => {
    const displayName = getItemDisplayName(item);
    const existingIndex = basket.findIndex(
      (b) => (b.name === displayName || b.name === item.nameEnglish) && b.unitPrice === item.price
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
          name: displayName,
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

  const decrementItemInBasket = (item: MenuItemRecord) => {
    const displayName = getItemDisplayName(item);
    const existingIndex = basket.findIndex(
      (b) => (b.name === displayName || b.name === item.nameEnglish) && b.unitPrice === item.price
    );
    if (existingIndex > -1) {
      const updated = [...basket];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
        updated[existingIndex].total =
          updated[existingIndex].quantity * updated[existingIndex].unitPrice;
        setBasket(updated);
      } else {
        updated.splice(existingIndex, 1);
        setBasket(updated);
      }
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

  const updateItemNotes = (index: number, notes: string) => {
    const updated = [...basket];
    updated[index].notes = notes;
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

        toast.success(`Order sent to ${currentTable.name}!`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-full sm:h-[94vh] flex flex-col rounded-none sm:rounded-3xl bg-card dark:bg-[#080808] border-0 sm:border border-border dark:border-white/10 text-foreground shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-foreground">
                  {mode === "NEW" ? "Take Order" : "Add Dishes"}
                </h2>
                {activeTargetTable && (
                  <button
                    type="button"
                    onClick={() => setShowTablePicker(!showTablePicker)}
                    className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-500/35 transition-colors"
                  >
                    <span>{activeTargetTable.name} • {activeTargetTable.floor}</span>
                    {showTablePicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Tap dishes to add to live order basket
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

        {/* Expandable Floor & Table Selector */}
        {showTablePicker && (
          <div className="p-3 border-b border-border dark:border-white/10 bg-secondary/40 dark:bg-[#0e0e0e] space-y-2 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FLOOR_CATEGORIES.map((floor) => (
                <button
                  key={floor.id}
                  type="button"
                  onClick={() => setSelectedFloor(floor.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedFloor === floor.id
                      ? "bg-amber-500 text-slate-950 border-amber-500"
                      : "bg-background dark:bg-black border-border dark:border-white/10 text-muted-foreground"
                  }`}
                >
                  <span>{floor.icon}</span>
                  <span>{floor.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {floorTables.map((t) => {
                const isSelected = activeTargetTable?.id === t.id;
                const isOccupied = t.status === "OCCUPIED";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTable(t);
                      setShowTablePicker(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                        : isOccupied
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35"
                        : "bg-background dark:bg-black border-border text-foreground hover:border-amber-400"
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
          </div>
        )}

        {/* 📱 MOBILE VIEW TAB SWITCHER */}
        <div className="flex md:hidden border-b border-border dark:border-white/10 bg-secondary/30 dark:bg-[#0a0a0a] p-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab("MENU")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mobileTab === "MENU"
                ? "bg-amber-500 text-slate-950 shadow-sm font-black"
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
                ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Basket ({basket.length})</span>
            {basket.length > 0 && (
              <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full">
                {formatNpr(basketSubtotal)}
              </span>
            )}
          </button>
        </div>

        {/* Main Content Split: Left Menu (60%), Right Basket (40%) on desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* ========================================================================= */}
          {/* LEFT: Menu Item Picker */}
          {/* ========================================================================= */}
          <div
            className={`flex-1 flex flex-col border-r border-border dark:border-white/10 overflow-hidden bg-background dark:bg-[#080808] ${
              mobileTab === "MENU" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Search & Category Filter Header */}
            <div className="p-2.5 sm:p-3 border-b border-border dark:border-white/10 space-y-2 bg-secondary/30 dark:bg-[#0c0c0c] shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dishes (Momo, Roast, Sadeko, Tea, Biryani)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills Scroller */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedCategory === "ALL"
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                      : "bg-card dark:bg-black text-foreground border-border dark:border-white/10 hover:border-amber-400"
                  }`}
                >
                  <span>🍽️</span>
                  <span>All ({menuItems.length})</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      selectedCategory === cat.name
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : "bg-card dark:bg-black text-foreground border-border dark:border-white/10 hover:border-amber-400"
                    }`}
                  >
                    <span>{cat.icon || getCategoryEmoji(cat.name)}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Responsive Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-20 md:pb-3">
              {filteredItems.map((item) => {
                const qty = getItemQuantityInBasket(item);
                const emoji = getCategoryEmoji(item.category);

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col justify-between p-3 rounded-2xl border transition-all duration-150 select-none shadow-xs ${
                      qty > 0
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30"
                        : "bg-card dark:bg-[#0e0e0e] border-border dark:border-white/10 hover:border-amber-500/40 hover:shadow-md"
                    }`}
                  >
                    {/* Top Row: Category Icon + Titles */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-lg shrink-0 border border-amber-500/25">
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-black text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                            {item.nameNepali}
                          </h4>
                          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase shrink-0">
                            {item.portion}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.nameEnglish}
                        </p>
                        {item.comboItems && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                            <Sparkles className="h-2.5 w-2.5" /> Combo Pack
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price & Quantity Controls */}
                    <div className="mt-3 pt-2 border-t border-border dark:border-white/10 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Price</span>
                        <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                          {formatNpr(item.price)}
                        </span>
                      </div>

                      {/* Interactive In-Card Stepper */}
                      {qty > 0 ? (
                        <div className="flex items-center rounded-xl border border-amber-500/40 bg-background dark:bg-black p-0.5 shadow-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              decrementItemInBasket(item);
                            }}
                            className="p-1 rounded-lg text-foreground hover:text-red-500 hover:bg-secondary transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addItemToBasket(item);
                            }}
                            className="p-1 rounded-lg text-foreground hover:text-emerald-500 hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addItemToBasket(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs transition-transform active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
                  No matching dishes found.
                </div>
              )}
            </div>

            {/* 📱 Mobile Floating Cart Bar */}
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
                      {basket.length} {basket.length === 1 ? "Dish" : "Dishes"} Selected
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
          {/* RIGHT: Order Basket & Checkout Details */}
          {/* ========================================================================= */}
          <div
            className={`w-full md:w-[380px] lg:w-[420px] flex flex-col justify-between overflow-hidden bg-secondary/30 dark:bg-[#0b0b0b] ${
              mobileTab === "BASKET" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Basket Header */}
            <div className="p-3.5 border-b border-border dark:border-white/10 flex items-center justify-between bg-card dark:bg-[#0c0c0c] shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Order Basket ({basket.length})
                </span>
              </div>
              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBasket([])}
                  className="text-[11px] font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Basket Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {basket.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="p-3 rounded-2xl bg-card dark:bg-[#111111] border border-border dark:border-white/10 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground truncate">
                        {item.name}
                      </p>
                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/25 uppercase">
                        {item.portion || "REGULAR"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItemFromBasket(idx)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Quantity & Unit Price Row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border dark:border-white/5">
                    {/* Stepper */}
                    <div className="flex items-center rounded-lg border border-border dark:border-white/15 bg-background dark:bg-black p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="p-1 rounded text-muted-foreground hover:text-red-500"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-black text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="p-1 rounded text-muted-foreground hover:text-emerald-500"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Unit Price */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground font-semibold">@ Rs</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateUnitPrice(idx, parseFloat(e.target.value) || 0)}
                        className="w-16 px-1.5 py-0.5 text-center font-mono font-bold rounded-lg border border-border dark:border-white/10 bg-background dark:bg-black text-foreground focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Item Total */}
                    <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                      {formatNpr(item.total)}
                    </span>
                  </div>

                  {/* Kitchen Special Note Input */}
                  <input
                    type="text"
                    placeholder="Dish note (e.g. कम पिरो, no onions)..."
                    value={item.notes || ""}
                    onChange={(e) => updateItemNotes(idx, e.target.value)}
                    className="w-full px-2 py-1 text-[11px] rounded-lg bg-secondary/50 dark:bg-black/40 border border-border dark:border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}

              {basket.length === 0 && (
                <div className="py-16 text-center space-y-2 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto opacity-30" />
                  <p className="text-xs">Your basket is empty.</p>
                  <p className="text-[11px]">Select dishes from the menu to build the order.</p>
                </div>
              )}
            </div>

            {/* Guest & Order Info + Submit Footer */}
            <div className="p-3.5 border-t border-border dark:border-white/10 bg-card dark:bg-[#0d0d0d] space-y-3 shrink-0">
              {/* Guest Details (Optional) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Guest Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/10 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-background dark:bg-black border border-border dark:border-white/10">
                  <span className="text-[10px] text-muted-foreground font-bold">Guests:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center font-mono font-bold text-xs">{guestCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtotal & Confirm Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-muted-foreground">Subtotal:</span>
                <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {formatNpr(basketSubtotal)}
                </span>
              </div>

              <button
                type="button"
                disabled={basket.length === 0 || submitting}
                onClick={handleSubmit}
                className="w-full py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Sending Order...</span>
                ) : (
                  <>
                    <span>Confirm & Send to Kitchen</span>
                    <ArrowRight className="h-4 w-4" />
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
