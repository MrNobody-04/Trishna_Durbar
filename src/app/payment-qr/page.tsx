"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Plus, Trash2, Building, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export default function PaymentQrPage() {
  const [qrs, setQrs] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchQrs = async () => {
    try {
      const res = await fetch("/api/payment-qr");
      const data = await res.json();
      if (data?.qrs) setQrs(data.qrs);
    } catch {
      toast.error("Failed to load QR codes");
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const handleCreateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountName || !qrImageUrl) {
      toast.error("Please fill in bank name, account name and QR image URL");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName,
          accountName,
          accountNumber,
          qrImageUrl,
          notes,
          isDefault: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create QR code");

      toast.success("Payment QR code saved!");
      setModalOpen(false);
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setQrImageUrl("");
      setNotes("");
      fetchQrs();
    } catch (err: any) {
      toast.error(err.message || "Failed to create QR code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-durbar-card border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Payment Integrations
            </span>
            <span className="text-xs text-slate-400">• Fonepay / Banking QR</span>
          </div>
          <h1 className="text-2xl font-black text-amber-200 mt-2">
            Restaurant Payment QR Codes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Display official Fonepay, eSewa and bank QR codes at checkout for swift cashless settlement.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Bank QR</span>
        </button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {qrs.map((qr) => (
          <div
            key={qr.id}
            className="p-5 rounded-2xl bg-durbar-card border border-slate-800 flex flex-col items-center text-center space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Active
              </span>
              {qr.isDefault && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Default Display
                </span>
              )}
            </div>

            {/* QR Image */}
            <div className="w-48 h-48 rounded-xl bg-white p-2 border-2 border-amber-500/30 shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr.qrImageUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="space-y-0.5 w-full">
              <h3 className="text-sm font-bold text-slate-200">{qr.bankName}</h3>
              <p className="text-xs font-semibold text-amber-300">{qr.accountName}</p>
              <p className="text-[11px] font-mono text-slate-400">
                A/C: {qr.accountNumber}
              </p>
              {qr.notes && (
                <p className="text-[11px] text-slate-500 italic mt-1">{qr.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-durbar-dark border border-amber-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-amber-200">Configure Bank QR</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQr} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Bank / Provider Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global IME Bank / Fonepay"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Account Name (Payee)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRISHNA DURBAR RESTAURANT"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01010100987654321"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  QR Code Image URL / Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or data:image/..."
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20"
                >
                  {submitting ? "Saving..." : "Save QR Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
