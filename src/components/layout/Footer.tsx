"use client";

import { Sparkles } from "lucide-react";
import { RoyalDurbarLogo } from "@/components/ui/RoyalDurbarLogo";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/95 dark:bg-black text-muted-foreground py-5 px-4 sm:px-6 transition-colors duration-200">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Restaurant Identity with Royal Emblem */}
        <RoyalDurbarLogo size="sm" />

        {/* DEVELOPED BY SUJANGC (Mandatory user specification) */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm shadow-amber-500/10">
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
