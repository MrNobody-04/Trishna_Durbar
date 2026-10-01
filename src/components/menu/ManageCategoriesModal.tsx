"use client";

import React, { useState } from "react";
import { X, Tag, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  label: string;
  icon?: string;
  sortOrder: number;
}

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onRefresh: () => void;
}

export function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  onRefresh,
}: ManageCategoriesModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("🍽️");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !categoryLabel.trim()) {
      toast.error("Please fill in category code and label");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName.trim().toUpperCase(),
          label: categoryLabel.trim(),
          icon: categoryIcon.trim() || "🍽️",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      toast.success(`Category "${categoryLabel}" created!`);
      setCategoryName("");
      setCategoryLabel("");
      setCategoryIcon("🍽️");
      setShowAddForm(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${cat.label}"? Existing items in this category won't be deleted but will appear under All Dishes.`
      )
    ) {
      return;
    }

    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      toast.success(`Category "${cat.label}" removed`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col rounded-none sm:rounded-3xl bg-card dark:bg-[#080808] border-0 sm:border border-border dark:border-white/10 text-foreground shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground">
                Menu Categories Configuration
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Create new custom dish categories for kitchen & billing
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              Current Categories ({categories.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddForm ? "Cancel" : "+ New Category"}</span>
            </button>
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateCategory}
              className="p-4 rounded-2xl bg-secondary/40 dark:bg-white/[0.03] border border-amber-500/30 space-y-3 animate-in slide-in-from-top-2 duration-150"
            >
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Create New Custom Category
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    System Code (e.g. HOOKAH) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOOKAH"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Display Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 💨 हुक्का (Hookah)"
                    value={categoryLabel}
                    onChange={(e) => setCategoryLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Emoji / Icon
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 💨 or 🍺"
                    value={categoryIcon}
                    onChange={(e) => setCategoryIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl border border-border dark:border-white/10 text-xs text-muted-foreground hover:bg-secondary dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 dark:bg-[#0d0d0d] border border-border dark:border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.icon || "🍽️"}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{cat.label}</p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400/80 font-mono">
                      Code: {cat.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCategory(cat)}
                  disabled={deletingId === cat.id}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Remove category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-border dark:border-white/10 bg-secondary/60 dark:bg-[#0d0d0d] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
