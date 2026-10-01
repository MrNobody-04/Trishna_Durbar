"use client";

import React, { useState, useRef } from "react";
import {
  Users,
  Clock,
  Receipt,
  Utensils,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Printer,
  Layers,
} from "lucide-react";
import { DiningTableData } from "@/types";
import { formatNpr, formatNepalTimeOnly } from "@/lib/utils";

interface Table3DCardProps {
  table: DiningTableData;
  onOpenOrder: (table: DiningTableData) => void;
  onViewBill: (table: DiningTableData) => void;
  onAddItems: (table: DiningTableData) => void;
  onSettle?: (table: DiningTableData) => void;
  onPrintKot: (table: DiningTableData) => void;
}

export function Table3DCard({
  table,
  onOpenOrder,
  onViewBill,
  onAddItems,
  onSettle,
  onPrintKot,
}: Table3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const isOccupied = table.status === "OCCUPIED" && table.activeOrder;
  const activeOrder = table.activeOrder;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const getElapsedMinutes = () => {
    if (!activeOrder?.createdAt) return null;
    const diffMs = Date.now() - new Date(activeOrder.createdAt).getTime();
    const mins = Math.floor(diffMs / (60 * 1000));
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const getFloorName = (fl: string) => {
    switch (fl) {
      case "GROUND":
        return "Ground Floor";
      case "HALL":
        return "Main Hall";
      case "FIRST_FLOOR":
        return "1st Floor VIP";
      case "ROOFTOP":
        return "Rooftop Terrace";
      default:
        return fl;
    }
  };

  return (
    <div className="perspective-container h-full" style={{ perspective: "1000px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
        }}
        className={`relative flex flex-col justify-between rounded-3xl border p-4 sm:p-5 transition-all duration-300 shadow-md ${
          isOccupied
            ? "bg-card dark:bg-[#0d0d0d] border-amber-500/50 shadow-amber-500/10 dark:shadow-[0_4px_20px_rgba(245,158,11,0.08)]"
            : "bg-card dark:bg-[#080808] border-border dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-amber-500/40"
        }`}
      >
        {/* Specular Glare Effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.15 : 0,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 60%)`,
          }}
        />

        {/* Card Header: Table Name, Floor & Status Badge */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-wide">
                  {table.name}
                </h3>
                {isOccupied && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                <Layers className="h-3 w-3 text-amber-500" />
                <span>{getFloorName(table.floor)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {table.capacity} Seats
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                isOccupied
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOccupied ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              {isOccupied ? "Occupied" : "Available"}
            </span>
          </div>

          {/* Active Order Details or Empty State */}
          <div className="mt-4 pt-3 border-t border-border">
            {isOccupied && activeOrder ? (
              <div className="space-y-2.5">
                {/* Customer & Time Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground truncate max-w-[140px]">
                    👤 {activeOrder.customerName}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Clock className="h-3 w-3" />
                    {getElapsedMinutes()}
                  </span>
                </div>

                {/* Diners & Items count */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Diners: {activeOrder.guestCount} guests</span>
                  <span>Items: {activeOrder.items?.length || 0} dishes</span>
                </div>

                {/* Running Bill Total Display */}
                <div className="p-2.5 rounded-xl bg-secondary/60 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Running Bill
                    </span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-300">
                      {formatNpr(activeOrder.totalAmount)}
                    </span>
                  </div>
                  {activeOrder.paidAmount > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Paid: {formatNpr(activeOrder.paidAmount)}
                      </span>
                      <span className="text-xs font-bold text-red-500">
                        Due: {formatNpr(activeOrder.totalAmount - activeOrder.paidAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* KOT Status Indicator */}
                <div className="flex items-center justify-between text-[10px]">
                  {activeOrder.kotPrinted ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> KOT Sent to Kitchen
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> KOT Pending Print
                    </span>
                  )}
                  <span className="text-muted-foreground font-mono">
                    {formatNepalTimeOnly(activeOrder.createdAt)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Ready for incoming guests</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400/90 mt-1 font-medium">
                  Tap to take table order
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-border">
          {isOccupied && activeOrder ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddItems(table);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm transition-all hover:scale-[1.01]"
                >
                  <Utensils className="h-3.5 w-3.5" />
                  Add Food
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintKot(table);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-colors"
                  title="Print Kitchen Order Ticket"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-500" />
                  Print KOT
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewBill(table);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 shadow-xs transition-all hover:scale-[1.01]"
              >
                <Receipt className="h-3.5 w-3.5 text-amber-500" />
                <span>Live Bill & Settle ({formatNpr(activeOrder.totalAmount)})</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenOrder(table)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="h-4 w-4" />
              Open New Table Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
