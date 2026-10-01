"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { RoyalDurbarLogo } from "@/components/ui/RoyalDurbarLogo";
import { SessionUser } from "@/types";

export function Footer() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "OWNER":
      case "SUPER_ADMIN":
        return "Royal Owner";
      case "MANAGER":
      case "ADMIN":
        return "Durbar Manager";
      case "CASHIER":
        return "Cashier POS";
      case "WAITER":
        return "Floor Service";
      case "KITCHEN":
        return "Master Chef";
      default:
        return role || "Staff";
    }
  };

  return (
    <footer className="w-full border-t border-border bg-card/95 dark:bg-[#070605] text-muted-foreground py-6 px-4 sm:px-6 transition-colors duration-200">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Restaurant Identity & Logged In Staff Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5">
          <RoyalDurbarLogo size="sm" />
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 dark:bg-[#15120c] border border-amber-500/35 shadow-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
              <div className="text-left">
                <p className="text-xs font-black text-foreground leading-tight">
                  {user.name || "Durbar Staff"}
                </p>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wide">
                  👑 {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Legal Copyright & Compliance Notice */}
        <div className="text-center text-[11px] text-muted-foreground space-y-0.5">
          <p className="font-bold text-foreground">
            © {new Date().getFullYear()} Trishna Durbar Restaurant & Bar. All Rights Reserved.
          </p>
          <p className="text-[10px] text-muted-foreground">
            Licensed & Regulated under the Government of Nepal Hospitality & Commercial Standards • PAN / VAT Registered
          </p>
        </div>

        {/* Right: Signature Developer Credit */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm shadow-amber-500/10 shrink-0">
          <Sparkles className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: "6s" }} />
          <span className="text-xs tracking-wider uppercase font-semibold text-foreground">
            Developed by{" "}
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
              SUJANGC
            </span>
          </span>
          <span className="text-sm">🇳🇵</span>
        </div>
      </div>
    </footer>
  );
}
