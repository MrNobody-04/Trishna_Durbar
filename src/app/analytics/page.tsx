"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  Flame,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatNpr, TimePeriod } from "@/lib/utils";
import { toast } from "sonner";

const COLORS = [
  "#F59E0B", // Gold / Amber
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [period, setPeriod] = useState<TimePeriod>("today");
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async (targetPeriod: TimePeriod = period) => {
    // Only show full loading spinner on initial mount; smoothly update without flashing blank on period change
    if (!metrics) setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${targetPeriod}`);
      if (!res.ok) throw new Error("Failed to load metrics");
      const data = await res.json();
      if (data?.metrics) setMetrics(data.metrics);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchMetrics(period);
  }, [period]);

  const comparisonData = metrics
    ? [
        {
          name: "Sales",
          amount: metrics.totalRevenue,
          fill: "#F59E0B",
        },
        {
          name: "Expenses",
          amount: metrics.totalExpense,
          fill: "#EF4444",
        },
        {
          name: "Net Profit",
          amount: Math.max(0, metrics.netProfit),
          fill: metrics.netProfit >= 0 ? "#10B981" : "#EF4444",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-durbar-card border border-amber-500/30">
        <div>
          <h1 className="text-2xl font-black text-amber-200">
            Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sales revenue, operational expenses, net profit, occupancy, and top-selling food items.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {(["today", "week", "month", "all"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="p-5 rounded-2xl bg-durbar-card border border-slate-800 hover:border-amber-500/40 transition-all shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Total Revenue</span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300 mt-2 font-mono">
              {formatNpr(metrics.totalRevenue)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              From {metrics.totalOrders} completed dining orders
            </p>
          </div>

          {/* Expenses */}
          <div className="p-5 rounded-2xl bg-durbar-card border border-slate-800 hover:border-red-500/40 transition-all shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Total Outflow</span>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-black text-red-400 mt-2 font-mono">
              {formatNpr(metrics.totalExpense)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Meat, groceries, utilities & salaries
            </p>
          </div>

          {/* Net Profit */}
          <div className="p-5 rounded-2xl bg-durbar-card border border-slate-800 hover:border-emerald-500/40 transition-all shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Net Profit</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p
              className={`text-2xl font-black mt-2 font-mono ${
                metrics.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatNpr(metrics.netProfit)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Formula: Revenue - Expenses
            </p>
          </div>

          {/* Table Occupancy */}
          <div className="p-5 rounded-2xl bg-durbar-card border border-slate-800 hover:border-amber-500/40 transition-all shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Live Occupancy</span>
              <Users className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-200 mt-2 font-mono">
              {metrics.tableOccupancyRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.occupiedTables} of {metrics.totalTables} tables active ({metrics.currentActiveDiners} seated)
            </p>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue vs Expenses vs Net Result */}
          <div className="p-5 rounded-3xl bg-durbar-card border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-amber-200">
                Financial Balance Overview
              </h3>
              <p className="text-xs text-slate-400">
                Revenue vs Expenses vs Net Profit ({period})
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {mounted && comparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `Rs.${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F1626",
                        borderColor: "#F59E0B",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [formatNpr(Number(value)), "Amount"]}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">Loading chart...</div>
              )}
            </div>
          </div>

          {/* Chart 2: Revenue by Floor Zone */}
          <div className="p-5 rounded-3xl bg-durbar-card border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-amber-200">
                Sales by Floor Zone
              </h3>
              <p className="text-xs text-slate-400">
                Ground Floor, Main Hall, First Floor VIP & Rooftop
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {mounted && metrics.floorStats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.floorStats}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `Rs.${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F1626",
                        borderColor: "#F59E0B",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [formatNpr(Number(value)), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#D97706" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">Loading floor telemetry...</div>
              )}
            </div>
          </div>

          {/* Top Selling Items Table / Card */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-durbar-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-amber-200 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  Top Best-Selling Menu Items
                </h3>
                <p className="text-xs text-slate-400">
                  Ranked by sales revenue and quantity ordered
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.topItems?.map((it: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[130px]">
                        {it.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {it.count} plates sold
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-300 font-mono">
                    {formatNpr(it.revenue)}
                  </span>
                </div>
              ))}
              {(!metrics.topItems || metrics.topItems.length === 0) && (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                  No sales data yet for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
