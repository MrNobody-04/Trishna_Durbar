"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
  Edit2,
  Trash2,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { formatNpr } from "@/lib/utils";
import { toast } from "sonner";
import { ManageCategoriesModal } from "@/components/menu/ManageCategoriesModal";
import { CreateComboModal } from "@/components/menu/CreateComboModal";

interface MenuItem {
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

interface Category {
  id: string;
  name: string;
  label: string;
  icon?: string;
  sortOrder: number;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Full Edit Dish Modal State
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [editNameEnglish, setEditNameEnglish] = useState("");
  const [editNameNepali, setEditNameNepali] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPortion, setEditPortion] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Item State
  const [newNameNepali, setNewNameNepali] = useState("");
  const [newNameEnglish, setNewNameEnglish] = useState("");
  const [newCategory, setNewCategory] = useState("CHICKEN");
  const [newPortion, setNewPortion] = useState("REGULAR");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inline Quick Price Edit State (dish id -> string price)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const fetchMenu = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/categories"),
      ]);

      if (menuRes.ok) {
        const mData = await menuRes.json();
        if (mData?.items) setItems(mData.items);
      }

      if (catRes.ok) {
        const cData = await catRes.json();
        if (cData?.categories) setCategories(cData.categories);
      }
    } catch {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update item");

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isAvailable: !it.isAvailable } : it))
      );
      toast.success("Dish availability updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleSavePrice = async (itemId: string) => {
    const p = parseFloat(editPriceVal);
    if (isNaN(p) || p < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSavingPrice(true);
    try {
      const res = await fetch(`/api/menu/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: p }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update price");

      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, price: p } : it))
      );
      toast.success("Price updated successfully!");
      setEditingPriceId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update price");
    } finally {
      setSavingPrice(false);
    }
  };

  const openFullEditModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setEditNameEnglish(dish.nameEnglish);
    setEditNameNepali(dish.nameNepali);
    setEditCategory(dish.category);
    setEditPortion(dish.portion);
    setEditPrice(dish.price.toString());
    setEditDescription(dish.description || "");
  };

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    const p = parseFloat(editPrice);
    if (isNaN(p) || p < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/menu/${editingDish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEnglish: editNameEnglish.trim(),
          nameNepali: editNameNepali.trim() || editNameEnglish.trim(),
          category: editCategory,
          portion: editPortion,
          price: p,
          description: editDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update dish details");

      toast.success(`"${editNameEnglish}" updated successfully!`);
      setEditingDish(null);
      fetchMenu();
    } catch (err: any) {
      toast.error(err.message || "Failed to update dish");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteDish = async (dish: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${dish.nameEnglish}" from menu?`)) return;

    try {
      const res = await fetch(`/api/menu/${dish.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete dish");

      toast.success(`"${dish.nameEnglish}" removed from menu`);
      setItems((prev) => prev.filter((it) => it.id !== dish.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete dish");
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameEnglish || !newPrice) {
      toast.error("Please fill in dish name and price");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameNepali: newNameNepali.trim() || newNameEnglish.trim(),
          nameEnglish: newNameEnglish.trim(),
          category: newCategory,
          portion: newPortion,
          price: parseFloat(newPrice),
          description: newDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create dish");

      toast.success(`Dish "${newNameEnglish}" added to menu!`);
      setAddModalOpen(false);
      setNewNameNepali("");
      setNewNameEnglish("");
      setNewPrice("");
      setNewDescription("");
      fetchMenu();
    } catch (err: any) {
      toast.error(err.message || "Failed to add dish");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchCat =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.nameEnglish.toLowerCase().includes(q) ||
      item.nameNepali.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Complete Digital Menu & Offers
            </span>
            <span className="text-xs text-muted-foreground">• {items.length} Dishes</span>
          </div>
          <h1 className="text-2xl font-black text-foreground mt-2">
            Trishna Durbar Menu & Special Combos
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Edit dish prices on the fly, adjust portions, bundle feast combos, and manage categories.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setComboModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            <span>+ Create Combo Offer</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground transition-colors"
          >
            <Plus className="h-4 w-4 text-amber-500" />
            <span>+ Add Dish</span>
          </button>

          <button
            onClick={() => setCategoriesModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground transition-colors"
          >
            <Tag className="h-4 w-4 text-amber-500" />
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        {/* Dynamic Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            🍽️ All Dishes ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-card dark:bg-[#0d0d0d] border border-border dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{cat.icon || "🍽️"}</span> {cat.label}
              <span className="text-[10px] opacity-70 ml-1">
                ({items.filter((i) => i.category === cat.name).length})
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dish by English or Nepali name (e.g. Momo, Roast, मटन, सेकुवा, Combo)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Menu Grid with INLINE PRICE EDITING & FULL EDIT MODAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.map((item) => {
          const isCombo = item.category === "COMBO" || !!item.comboItems;
          const isEditingThis = editingPriceId === item.id;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isCombo
                  ? "bg-gradient-to-br from-amber-500/10 via-card to-card dark:from-[#120f08] dark:via-[#0d0a05] dark:to-[#080808] border-amber-500/40 shadow-md shadow-amber-500/5 hover:border-amber-400"
                  : item.isAvailable
                  ? "bg-card dark:bg-[#0d0d0d] border-border dark:border-white/10 hover:border-amber-500/40 shadow-xs"
                  : "bg-secondary/40 dark:bg-[#080808] border-border dark:border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-black text-foreground">
                        {item.nameNepali}
                      </h3>
                      {isCombo && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          <Sparkles className="h-2.5 w-2.5" /> COMBO OFFER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {item.nameEnglish}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 shrink-0">
                    {item.portion}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Price Row with Live Price Editing & Full Edit Button */}
              <div className="mt-4 pt-3 border-t border-border dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Price
                  </span>
                  {isEditingThis ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs font-bold text-amber-500">Rs</span>
                      <input
                        type="number"
                        min="0"
                        value={editPriceVal}
                        onChange={(e) => setEditPriceVal(e.target.value)}
                        className="w-20 px-2 py-0.5 rounded bg-background dark:bg-black border border-amber-400 text-xs font-bold text-foreground focus:outline-none"
                      />
                      <button
                        onClick={() => handleSavePrice(item.id)}
                        disabled={savingPrice}
                        className="p-1 rounded bg-amber-400 text-slate-950 hover:bg-amber-300"
                        title="Save price"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/price">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                        {formatNpr(item.price)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingPriceId(item.id);
                          setEditPriceVal(item.price.toString());
                        }}
                        className="p-1 text-muted-foreground hover:text-amber-500"
                        title="Quick edit price"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Full Edit Dish Details */}
                  <button
                    onClick={() => openFullEditModal(item)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10 transition-colors"
                    title="Edit dish details"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
                  </button>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      item.isAvailable
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-red-500/15 text-red-500 border border-red-500/30 hover:bg-red-500/25"
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>Stock</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span>Out</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteDish(item)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete dish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
            No dishes matching your criteria.
          </div>
        )}
      </div>

      {/* Add New Dish Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10">
              <h3 className="text-base font-black text-foreground">Add New Dish</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Dish Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Tandoori (Full)"
                  value={newNameEnglish}
                  onChange={(e) => setNewNameEnglish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Dish Name (Nepali)
                </label>
                <input
                  type="text"
                  placeholder="e.g. चिकन तन्दुरी"
                  value={newNameNepali}
                  onChange={(e) => setNewNameNepali(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Portion
                  </label>
                  <select
                    value={newPortion}
                    onChange={(e) => setNewPortion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                  >
                    <option value="REGULAR">Regular (सादा)</option>
                    <option value="HALF">Half (हाफ)</option>
                    <option value="FULL">Full (फुल)</option>
                    <option value="MINI">Mini (मिनी)</option>
                    <option value="LARGE">Large (लार्ज)</option>
                    <option value="PIECE">Piece (पिस)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Price in NPR (Rs) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 350"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description / Ingredients (Optional)
                </label>
                <textarea
                  placeholder="Notes or description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Add to Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Edit Dish Modal */}
      {editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10">
              <h3 className="text-base font-black text-foreground">
                Edit Dish — {editingDish.nameEnglish}
              </h3>
              <button
                onClick={() => setEditingDish(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Dish Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editNameEnglish}
                  onChange={(e) => setEditNameEnglish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Dish Name (Nepali)
                </label>
                <input
                  type="text"
                  value={editNameNepali}
                  onChange={(e) => setEditNameNepali(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Portion
                  </label>
                  <select
                    value={editPortion}
                    onChange={(e) => setEditPortion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                  >
                    <option value="REGULAR">Regular (सादा)</option>
                    <option value="HALF">Half (हाफ)</option>
                    <option value="FULL">Full (फुल)</option>
                    <option value="MINI">Mini (मिनी)</option>
                    <option value="LARGE">Large (लार्ज)</option>
                    <option value="PIECE">Piece (पिस)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Price in NPR (Rs) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description / Ingredients (Optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50"
                >
                  {savingEdit ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Child Modals */}
      <CreateComboModal
        isOpen={comboModalOpen}
        onClose={() => setComboModalOpen(false)}
        availableItems={items}
        onSuccess={fetchMenu}
      />

      <ManageCategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        categories={categories}
        onRefresh={fetchMenu}
      />
    </div>
  );
}
