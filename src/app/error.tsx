"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client-side error for debugging
    console.error("Trishna Durbar Client Exception Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Trishna Durbar</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {error?.message || "A temporary application issue occurred while loading this view."}
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              try {
                reset();
              } catch {
                window.location.reload();
              }
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reload & Resume Operations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
