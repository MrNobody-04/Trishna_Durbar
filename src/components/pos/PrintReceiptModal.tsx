"use client";

import React, { useRef } from "react";
import { X, Printer, Crown } from "lucide-react";
import { DiningTableData } from "@/types";
import { formatNpr, formatNepalDateTime } from "@/lib/utils";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTableData | null;
  mode: "KOT" | "BILL";
}

export function PrintReceiptModal({
  isOpen,
  onClose,
  table,
  mode,
}: PrintReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !table || !table.activeOrder) return null;

  const order = table.activeOrder;

  const handlePrint = async () => {
    // If printing KOT, mark kotPrinted in database
    if (mode === "KOT") {
      try {
        await fetch(`/api/orders/${order.id}/kot`, { method: "POST" });
      } catch {}
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-md rounded-3xl bg-[#080808] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Controls Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d0d]">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-200">
              {mode === "KOT" ? "Print Kitchen Order Ticket (KOT)" : "Print Customer Invoice"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Paper Preview */}
        <div className="p-4 overflow-y-auto max-h-[70vh] bg-slate-950 flex justify-center">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="w-[80mm] min-h-[100mm] bg-white text-black p-4 text-xs font-mono shadow-md border border-gray-300 leading-tight"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <h2 className="text-base font-extrabold uppercase tracking-wider">
                TRISHNA DURBAR
              </h2>
              <p className="text-[10px]">Restaurant & Bar • रेष्टुरेन्ट एण्ड बार</p>
              <p className="text-[9px]">Nepal Standard Time (NST)</p>
              <div className="mt-1 font-bold text-xs uppercase px-1 py-0.5 bg-gray-200 inline-block">
                {mode === "KOT" ? "KITCHEN ORDER TICKET (KOT)" : "CUSTOMER INVOICE"}
              </div>
            </div>

            {/* Metadata */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>TABLE: <strong className="text-sm">{table.name}</strong></span>
                <span>FLOOR: <strong>{table.floor}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>ORDER: #{order.id.slice(-6).toUpperCase()}</span>
                <span>DINERS: {order.guestCount}</span>
              </div>
              <div>GUEST: {order.customerName}</div>
              <div>DATE: {formatNepalDateTime(order.createdAt)}</div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-gray-300">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/6 text-center">QTY</span>
                {mode === "BILL" && <span className="w-1/3 text-right">TOTAL</span>}
              </div>

              <div className="pt-1 space-y-1">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div className="w-1/2">
                      <p className="font-bold">{it.name}</p>
                      {it.portion && it.portion !== "REGULAR" && (
                        <span className="text-[9px] text-gray-600">[{it.portion}] </span>
                      )}
                      {it.notes && (
                        <p className="text-[9px] font-semibold text-gray-700 italic">
                          Note: {it.notes}
                        </p>
                      )}
                    </div>
                    <span className="w-1/6 text-center font-bold">{it.quantity}</span>
                    {mode === "BILL" && (
                      <span className="w-1/3 text-right font-bold">
                        {formatNpr(it.total)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Summary (For Bills) */}
            {mode === "BILL" && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatNpr(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span>-{formatNpr(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-gray-300">
                  <span>GRAND TOTAL:</span>
                  <span>{formatNpr(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-700">
                  <span>Amount Paid:</span>
                  <span>{formatNpr(order.paidAmount)}</span>
                </div>
                {order.totalAmount - order.paidAmount > 0 ? (
                  <div className="flex justify-between font-bold text-red-600">
                    <span>Balance Due:</span>
                    <span>{formatNpr(order.totalAmount - order.paidAmount)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between font-bold text-green-700">
                    <span>Status:</span>
                    <span>PAID IN FULL</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 text-center text-[9px] text-gray-600 space-y-1">
              <p className="font-bold">Thank you for dining with us!</p>
              <p>Trishna Durbar Restaurant & Bar</p>
              <p className="text-[8px] font-semibold text-gray-500 pt-1 border-t border-gray-200">
                System Developed by SUJANGC
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 border-t border-amber-500/20 bg-durbar-card flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20"
          >
            <Printer className="h-4 w-4" />
            Print Now
          </button>
        </div>
      </div>
    </div>
  );
}
