"use client";

import React, { useState } from "react";
import {
  X,
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  HelpCircle,
} from "lucide-react";
import { DiningTableData, FloorArea } from "@/types";
import { toast } from "sonner";

interface ManageTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: DiningTableData[];
  onRefresh: () => void;
}

const FLOOR_OPTIONS: { id: FloorArea; label: string; icon: string }[] = [
  { id: "GROUND", label: "Ground Floor", icon: "🌿" },
  { id: "HALL", label: "Main Hall", icon: "🏛️" },
  { id: "FIRST_FLOOR", label: "First Floor (VIP)", icon: "👑" },
  { id: "ROOFTOP", label: "Rooftop Terrace", icon: "🌅" },
];

export function ManageTablesModal({
  isOpen,
  onClose,
  tables,
  onRefresh,
}: ManageTablesModalProps) {
  const [activeFloor, setActiveFloor] = useState<string>("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableFloor, setTableFloor] = useState<FloorArea>("GROUND");
  const [tableCapacity, setTableCapacity] = useState("4");
  const [tableNotes, setTableNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTables = tables.filter((t) => {
    if (activeFloor === "ALL") return true;
    return t.floor === activeFloor;
  });

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) {
      toast.error("Please enter a table name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tableName.trim(),
          floor: tableFloor,
          capacity: parseInt(tableCapacity) || 4,
          notes: tableNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create table");

      toast.success(`Table "${tableName.trim()}" created successfully!`);
      setTableName("");
      setTableNotes("");
      setShowAddForm(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create table");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (table: DiningTableData) => {
    if (table.status === "OCCUPIED" || table.activeOrder) {
      toast.error(
        `Cannot remove ${table.name} while an active order is in progress. Please settle or cancel the order first.`
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently remove ${table.name} from ${table.floor}?`
      )
    ) {
      return;
    }

    setDeletingId(table.id);
    try {
      const res = await fetch(`/api/tables/${table.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete table");

      toast.success(`${table.name} removed successfully!`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete table");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-border text-foreground shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                Table Configuration & Layout
              </h2>
              <p className="text-xs text-muted-foreground">
                Add, manage, or remove dining tables across all restaurant floors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Action Row & Floor Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveFloor("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFloor === "ALL"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                All Floors ({tables.length})
              </button>
              {FLOOR_OPTIONS.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloor(floor.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeFloor === floor.id
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span>{floor.icon}</span>
                  <span>{floor.label}</span>
                  <span className="text-[10px] opacity-75">
                    ({tables.filter((t) => t.floor === floor.id).length})
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/15 transition-all self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddForm ? "Cancel Add Table" : "+ Add New Table"}</span>
            </button>
          </div>

          {/* Add Table Inline Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddTable}
              className="p-4 sm:p-5 rounded-2xl bg-secondary/50 border border-amber-500/30 space-y-4 animate-in slide-in-from-top-2 duration-150"
            >
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Create New Dining Table
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Table Name / Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Table 10 or Rooftop VIP 3"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Floor Zone *
                  </label>
                  <select
                    value={tableFloor}
                    onChange={(e) => setTableFloor(e.target.value as FloorArea)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                  >
                    {FLOOR_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Seating Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Notes / Location Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near garden fountain, Window side with mountain view"
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save Table"}
                </button>
              </div>
            </form>
          )}

          {/* Tables Matrix List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Tables ({filteredTables.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredTables.map((t) => {
                const isOccupied = t.status === "OCCUPIED" || !!t.activeOrder;
                return (
                  <div
                    key={t.id}
                    className="relative flex flex-col justify-between p-4 rounded-2xl bg-secondary/40 border border-border hover:border-amber-500/40 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-foreground">{t.name}</p>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            {t.floor}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isOccupied
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {isOccupied ? "Occupied" : "Available"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>Capacity: {t.capacity} Guests</span>
                      </div>

                      {t.notes && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic line-clamp-1">
                          {t.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {isOccupied ? "Has active guest" : "Ready for guests"}
                      </span>

                      <button
                        onClick={() => handleDeleteTable(t)}
                        disabled={isOccupied || deletingId === t.id}
                        title={
                          isOccupied
                            ? "Cannot remove table while occupied"
                            : "Remove this table"
                        }
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isOccupied
                            ? "text-muted-foreground/40 cursor-not-allowed"
                            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border bg-card flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
