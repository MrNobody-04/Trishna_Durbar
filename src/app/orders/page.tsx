"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Eye,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpDown,
  X,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  Utensils,
  ChevronRight,
} from "lucide-react";
import { formatNpr, formatNepalDateTime, formatOrderNumber, getFloorLabel } from "@/lib/utils";
import { toast } from "sonner";
import { PrintReceiptModal } from "@/components/pos/PrintReceiptModal";
import { DiningTableData } from "@/types";

interface OrderItem {
  id: string;
  name: string;
  category: string;
  portion: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string | null;
  createdAt: string;
}

interface OrderPayment {
  id: string;
  amount: number;
  method: string;
  tendered: number | null;
  changeReturn: number | null;
  notes: string | null;
  recordedByName: string | null;
  timestamp: string;
}

interface OrderRecord {
  id: string;
  orderNumber: number | null;
  tableId: string;
  table: {
    id: string;
    name: string;
    floor: string;
    capacity: number;
  };
  customerName: string | null;
  customerPhone: string | null;
  guestCount: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  subtotal: number;
  discount: number;
  discountPercent: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string | null;
  notes: string | null;
  kotPrinted: boolean;
  settledAt: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: OrderPayment[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState({ completedOrdersCount: 0, totalRevenue: 0 });

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Print Receipt Modal
  const [printTableData, setPrintTableData] = useState<DiningTableData | null>(null);
  const [printMode, setPrintMode] = useState<"BILL" | "KOT">("BILL");
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const url = new URL("/api/orders", window.location.origin);
      if (selectedStatus !== "ALL") url.searchParams.set("status", selectedStatus);
      if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());
      url.searchParams.set("limit", "100");

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data?.orders) {
        setOrders(data.orders);
        if (data.summary) setSummary(data.summary);
      }
    } catch {
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleOpenPrint = (order: OrderRecord, mode: "BILL" | "KOT") => {
    // Construct mock DiningTableData for the PrintReceiptModal
    const tableData: DiningTableData = {
      id: order.table.id,
      name: order.table.name,
      floor: order.table.floor as any,
      status: order.status === "ACTIVE" ? "OCCUPIED" : "AVAILABLE",
      capacity: order.table.capacity,
      activeOrder: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        guestCount: order.guestCount,
        status: order.status as any,
        subtotal: order.subtotal,
        discount: order.discount,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        kotPrinted: order.kotPrinted,
        createdAt: order.createdAt,
        items: order.items.map((it) => ({
          name: it.name,
          portion: it.portion,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
          notes: it.notes,
        })),
      },
    };

    setPrintTableData(tableData);
    setPrintMode(mode);
    setPrintModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Settled / Completed
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" /> Active Dining
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Ban className="h-3 w-3" /> Cancelled / Voided
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              POS Records & Audit
            </span>
            <span className="text-xs text-muted-foreground">• Nepal Standard Time (NST)</span>
          </div>
          <h1 className="text-2xl font-black text-foreground mt-2">
            Order Tracking & History
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Track past dining bills, review settled invoices, audit voided orders, and reprint customer receipts or kitchen order tickets anytime.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-[#080808] border border-border dark:border-white/10">
          <p className="text-xs font-semibold text-muted-foreground">Total Orders Recorded</p>
          <p className="text-2xl font-black text-foreground mt-1">{orders.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Across all tables and floors</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-[#080808] border border-border dark:border-white/10">
          <p className="text-xs font-semibold text-emerald-400">Settled Bills Completed</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {summary.completedOrdersCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Successfully paid & vacated</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-[#080808] border border-amber-500/20">
          <p className="text-xs font-semibold text-amber-500">Total Settled Revenue</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {formatNpr(summary.totalRevenue)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Excludes cancelled & voided bills</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 rounded-2xl bg-card dark:bg-[#080808] border border-border dark:border-white/10">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "COMPLETED", label: "Settled" },
            { id: "ACTIVE", label: "Active" },
            { id: "CANCELLED", label: "Voided / Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === tab.id
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Order #, Table, Guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground">
          Loading order history records...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-card dark:bg-[#080808] border border-dashed border-border dark:border-white/10 text-center space-y-3">
          <ClipboardList className="h-10 w-10 text-amber-500/50 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Matching Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No records match "${searchQuery}". Try changing your search query.`
              : "No orders matching the selected status filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-secondary/40 dark:bg-[#0d0d0d] text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/5">
                {orders.map((o) => {
                  const orderCode = formatOrderNumber({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    createdAt: o.createdAt,
                  });

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-secondary/30 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Order Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-500">
                        #{orderCode}
                      </td>

                      {/* Table */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">{o.table.name}</div>
                        <div className="text-[10px] text-muted-foreground">{o.table.floor}</div>
                      </td>

                      {/* Guest */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">
                          {o.customerName || "Walk-in Guest"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {o.guestCount} {o.guestCount === 1 ? "guest" : "diners"}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {formatNepalDateTime(o.createdAt)}
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-foreground font-medium">
                          {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") ||
                            "No items"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {o.items?.length || 0} unique dishes
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-foreground">
                          {formatNpr(o.totalAmount)}
                        </div>
                        {o.discount > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            Disc: -{formatNpr(o.discount)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(o.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                            title="View Full Order Breakdown"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPrint(o, "BILL")}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 transition-colors"
                            title="Print Customer Invoice"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Order Details #{formatOrderNumber(selectedOrder)}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedOrder.table.name} • {selectedOrder.table.floor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-secondary/30 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Guest Name:</span>
                <span className="font-bold text-foreground">
                  {selectedOrder.customerName || "Walk-in Guest"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Status:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Order Time:</span>
                <span className="text-foreground">
                  {formatNepalDateTime(selectedOrder.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Settled At:</span>
                <span className="text-foreground">
                  {selectedOrder.settledAt
                    ? formatNepalDateTime(selectedOrder.settledAt)
                    : "Not settled yet"}
                </span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Ordered Dishes & Portions
              </h4>
              <div className="divide-y divide-border dark:divide-white/5 border border-border dark:border-white/10 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{it.name}</p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        {it.portion && it.portion !== "REGULAR" && (
                          <span>Portion: {it.portion}</span>
                        )}
                        <span>Qty: {it.quantity}</span>
                        <span>Rate: {formatNpr(it.unitPrice)}</span>
                      </div>
                      {it.notes && (
                        <p className="text-[10px] text-amber-500/80 italic mt-0.5">
                          Note: {it.notes}
                        </p>
                      )}
                    </div>
                    <span className="font-black text-foreground">{formatNpr(it.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 rounded-2xl bg-secondary/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatNpr(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Applied:</span>
                  <span>-{formatNpr(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-foreground pt-1.5 border-t border-border dark:border-white/10">
                <span>Final Bill Total:</span>
                <span className="text-amber-500">{formatNpr(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Paid Amount:</span>
                <span>{formatNpr(selectedOrder.paidAmount)}</span>
              </div>
            </div>

            {/* Payment Records (if settled) */}
            {selectedOrder.payments && selectedOrder.payments.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Payment Transactions
                </h4>
                <div className="p-2.5 rounded-xl bg-secondary/30 border border-border text-xs space-y-1">
                  {selectedOrder.payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-foreground">
                        {p.method} ({formatNepalDateTime(p.timestamp)})
                      </span>
                      <span className="font-bold text-emerald-400">{formatNpr(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border dark:border-white/10">
              <button
                type="button"
                onClick={() => handleOpenPrint(selectedOrder, "KOT")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-amber-500" />
                <span>Print KOT</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenPrint(selectedOrder, "BILL")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Customer Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal (Used for reprinting customer invoices or KOT) */}
      <PrintReceiptModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        table={printTableData}
        mode={printMode}
      />
    </div>
  );
}
