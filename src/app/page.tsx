"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Users,
  Receipt,
  UtensilsCrossed,
  Sparkles,
  QrCode,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Flame,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DiningTableData, FloorArea } from "@/types";
import { formatNpr, formatNepalDateTime } from "@/lib/utils";
import { Table3DCard } from "@/components/tables/Table3DCard";
import { OrderModal } from "@/components/pos/OrderModal";
import { LiveBillModal } from "@/components/pos/LiveBillModal";
import { PrintReceiptModal } from "@/components/pos/PrintReceiptModal";
import { PaymentQrModal } from "@/components/payment-qr/PaymentQrModal";
import { ManageTablesModal } from "@/components/tables/ManageTablesModal";
import { toast } from "sonner";

const FLOORS: { id: string; label: string; sub: string; icon: string }[] = [
  { id: "ALL", label: "All Areas", sub: "9 Tables", icon: "🏢" },
  { id: "GROUND", label: "Ground Floor", sub: "Tables 7, 8, 9", icon: "🌿" },
  { id: "HALL", label: "Main Hall", sub: "Tables 1, 2, 3", icon: "🏛️" },
  { id: "FIRST_FLOOR", label: "First Floor", sub: "Table 4 (VIP)", icon: "👑" },
  { id: "ROOFTOP", label: "Rooftop Terrace", sub: "Tables 5, 6", icon: "🌅" },
];

export default function DashboardLandingPage() {
  const [tables, setTables] = useState<DiningTableData[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeTable, setActiveTable] = useState<DiningTableData | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalMode, setOrderModalMode] = useState<"NEW" | "ADD_ITEMS">("NEW");
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"KOT" | "BILL">("BILL");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [manageTablesModalOpen, setManageTablesModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [tablesRes, metricsRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/analytics?period=today"),
      ]);

      if (tablesRes.ok) {
        const tData = await tablesRes.json();
        if (tData?.tables) {
          setTables(tData.tables);
          setActiveTable((prev) => {
            if (!prev) return null;
            return tData.tables.find((t: DiningTableData) => t.id === prev.id) || null;
          });
        }
      }

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        if (mData?.metrics) setMetrics(mData.metrics);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredTables = tables.filter((t) => {
    if (selectedFloor === "ALL") return true;
    return t.floor === selectedFloor;
  });

  const activeTablesList = tables.filter((t) => t.status === "OCCUPIED" && t.activeOrder);

  const comparisonData = metrics
    ? [
        { name: "Today Sales", amount: metrics.totalRevenue, fill: "#F59E0B" },
        { name: "Today Outflows", amount: metrics.totalExpense, fill: "#EF4444" },
        { name: "Net Profit", amount: Math.max(0, metrics.netProfit), fill: metrics.netProfit >= 0 ? "#10B981" : "#EF4444" },
      ]
    : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 👑 EXECUTIVE DASHBOARD HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 sm:p-7 shadow-lg transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Operations & Financial Dashboard
              </span>
              <span className="text-xs text-muted-foreground">• Live Floor Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Trishna Durbar Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Real-time table orders across Ground Floor, Main Hall, First Floor, and Rooftop, with live POS settlement, kitchen ticketing, and operational outflows.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setActiveTable(tables[0] || null);
                setOrderModalMode("NEW");
                setOrderModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Take Order</span>
            </button>

            <button
              onClick={() => setManageTablesModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-amber-500/30 text-xs font-bold text-foreground transition-colors"
            >
              <Layers className="h-4 w-4 text-amber-500" />
              <span>Manage Tables</span>
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground transition-colors"
            >
              <QrCode className="h-4 w-4 text-amber-500" />
              <span>Show QR</span>
            </button>

            <Link
              href="/expenses"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground transition-colors"
            >
              <Receipt className="h-4 w-4 text-amber-500" />
              <span>Expenses</span>
            </Link>

            <button
              onClick={fetchData}
              className="p-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 📊 LIVE KPI PERFORMANCE CARDS */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Today&apos;s Revenue
              </span>
              <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-300 font-mono mt-1">
                {formatNpr(metrics.totalRevenue)}
              </p>
              <span className="text-[10px] text-muted-foreground">{metrics.totalOrders} settled orders</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Today&apos;s Outflow
              </span>
              <p className="text-lg sm:text-xl font-black text-red-500 font-mono mt-1">
                {formatNpr(metrics.totalExpense)}
              </p>
              <span className="text-[10px] text-muted-foreground">Kitchen & utilities</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Net Profit
              </span>
              <p
                className={`text-lg sm:text-xl font-black font-mono mt-1 ${
                  metrics.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                }`}
              >
                {formatNpr(metrics.netProfit)}
              </p>
              <span className="text-[10px] text-muted-foreground">Sales - Expenses</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Table Occupancy
              </span>
              <p className="text-lg sm:text-xl font-black text-foreground font-mono mt-1">
                {metrics.tableOccupancyRate}%
              </p>
              <span className="text-[10px] text-muted-foreground">
                {metrics.occupiedTables} / {metrics.totalTables} tables occupied
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Seated Diners
              </span>
              <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {metrics.currentActiveDiners}
              </p>
              <span className="text-[10px] text-muted-foreground">Guests in-house</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Running Ledger
              </span>
              <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                {formatNpr(metrics.runningUnsettledRevenue)}
              </p>
              <span className="text-[10px] text-muted-foreground">Unbilled active orders</span>
            </div>
          </div>
        )}
      </div>

      {/* 🪑 FLOOR & TABLE CATEGORIZATION SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              Restaurant Floor Matrix ({tables.length} Tables)
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a floor zone to filter tables, view running bills, and dispatch KOTs
            </p>
          </div>

          {/* Floor Zone Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FLOORS.map((fl) => {
              const count =
                fl.id === "ALL"
                  ? tables.length
                  : tables.filter((t) => t.floor === fl.id).length;
              return (
                <button
                  key={fl.id}
                  onClick={() => setSelectedFloor(fl.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedFloor === fl.id
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 scale-[1.02]"
                      : "bg-card border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{fl.icon}</span>
                  <span>{fl.label}</span>
                  <span className="text-[10px] opacity-75 font-normal">({count} Tables)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Animated Interactive Table Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTables.map((table) => (
            <Table3DCard
              key={table.id}
              table={table}
              onOpenOrder={(t) => {
                setActiveTable(t);
                setOrderModalMode("NEW");
                setOrderModalOpen(true);
              }}
              onViewBill={(t) => {
                setActiveTable(t);
                setBillModalOpen(true);
              }}
              onAddItems={(t) => {
                setActiveTable(t);
                setOrderModalMode("ADD_ITEMS");
                setOrderModalOpen(true);
              }}
              onSettle={(t) => {
                setActiveTable(t);
                setBillModalOpen(true);
              }}
              onPrintKot={(t) => {
                setActiveTable(t);
                setPrintMode("KOT");
                setPrintModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* 📊 INLINE ANALYTICS & ACTIVE ORDERS LIVE FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Financial & Floor Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {metrics && (
            <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Today&apos;s Financial Balance
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Gross Sales vs Operational Outflows vs Net Result
                  </p>
                </div>
                <Link
                  href="/analytics"
                  className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Full Report <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `Rs.${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "#F59E0B",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                        fontSize: "12px",
                      }}
                      formatter={(v: any) => [formatNpr(Number(v)), "Amount"]}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {comparisonData.map((e, idx) => (
                        <Cell key={`cell-${idx}`} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Selling Dishes Widget */}
          {metrics?.topItems && metrics.topItems.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" />
                  Top Best-Selling Dishes Today
                </h3>
                <Link
                  href="/menu"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  View All Menu
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {metrics.topItems.slice(0, 4).map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                          {it.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{it.count} ordered</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                      {formatNpr(it.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Dining Tables Real-Time Feed (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-black text-foreground">
                  Active Dining Feed ({activeTablesList.length})
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Live Occupancy</span>
            </div>

            <div className="mt-3 divide-y divide-border max-h-[380px] overflow-y-auto">
              {activeTablesList.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTable(t);
                    setBillModalOpen(true);
                  }}
                  className="py-3 flex items-center justify-between hover:bg-secondary/40 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{t.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 font-semibold">
                        {t.floor}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      👤 {t.activeOrder?.customerName} • {t.activeOrder?.guestCount} guests
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-300 font-mono block">
                      {formatNpr(t.activeOrder?.totalAmount)}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {t.activeOrder?.items.length || 0} items
                    </span>
                  </div>
                </div>
              ))}

              {activeTablesList.length === 0 && (
                <div className="py-16 text-center text-muted-foreground text-xs space-y-1">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/60 mx-auto" />
                  <p className="font-semibold">All 9 tables are currently available!</p>
                  <p className="text-[11px]">Click &quot;+ Take Order&quot; above to seat guests.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tap any active row to open live bill</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Trishna Durbar Engine</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        table={activeTable}
        allTables={tables}
        mode={orderModalMode}
        onOrderSuccess={fetchData}
      />

      <LiveBillModal
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        table={activeTable}
        onRefresh={fetchData}
        onOpenAddItems={(t) => {
          setActiveTable(t);
          setBillModalOpen(false);
          setOrderModalMode("ADD_ITEMS");
          setOrderModalOpen(true);
        }}
        onPrintBill={(t) => {
          setActiveTable(t);
          setPrintMode("BILL");
          setPrintModalOpen(true);
        }}
        onPrintKot={(t) => {
          setActiveTable(t);
          setPrintMode("KOT");
          setPrintModalOpen(true);
        }}
        onShowQr={() => setQrModalOpen(true)}
      />

      <PrintReceiptModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        table={activeTable}
        mode={printMode}
      />

      <PaymentQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      <ManageTablesModal
        isOpen={manageTablesModalOpen}
        onClose={() => setManageTablesModalOpen(false)}
        tables={tables}
        onRefresh={fetchData}
      />
    </div>
  );
}
