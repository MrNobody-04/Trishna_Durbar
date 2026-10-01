"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, User, Activity } from "lucide-react";
import { formatNepalDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data?.logs) setLogs(data.logs);
      })
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  const formatActionBadge = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Staff Login
          </span>
        );
      case "USER_LOGOUT":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Staff Logout
          </span>
        );
      case "ORDER_DELETED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            Order Deleted
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-durbar-card border border-amber-500/30">
        <h1 className="text-2xl font-black text-amber-200">
          System Audit Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological security record of user logins, logouts, and order deletion authorizations.
        </p>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-durbar-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp (NST)</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Staff User</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                    {formatNepalDateTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    {formatActionBadge(log.action)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-200">{log.userName}</span>
                    {log.user?.role && (
                      <span className="ml-1.5 text-[10px] text-amber-400 font-mono">
                        [{log.user.role}]
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {log.entity}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[10px] max-w-xs truncate">
                    {log.metadata || "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500 text-xs">
                    No audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
