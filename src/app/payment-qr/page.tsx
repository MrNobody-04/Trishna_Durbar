"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Plus,
  Trash2,
  Building,
  CheckCircle2,
  X,
  Edit2,
  Star,
  Upload,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface PaymentQrItem {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
  notes?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

const BANK_PRESETS = [
  { name: "Fonepay Merchant", account: "Trishna Durbar Restro", sampleUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=fonepay://trishnadurbar" },
  { name: "Global IME Bank", account: "Trishna Durbar Pvt Ltd", sampleUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=globalime://trishnadurbar" },
  { name: "eSewa Direct Pay", account: "Trishna Durbar Restro", sampleUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=esewa://trishnadurbar" },
  { name: "Nabil Bank QR", account: "Trishna Durbar Pvt Ltd", sampleUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=nabil://trishnadurbar" },
  { name: "NIC Asia Bank", account: "Trishna Durbar Pvt Ltd", sampleUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=nicasia://trishnadurbar" },
];

export default function PaymentQrPage() {
  const [qrs, setQrs] = useState<PaymentQrItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State (for both Add and Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQr, setEditingQr] = useState<PaymentQrItem | null>(null);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [qrToDelete, setQrToDelete] = useState<PaymentQrItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQrs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment-qr");
      const data = await res.json();
      if (data?.qrs) setQrs(data.qrs);
    } catch {
      toast.error("Failed to load QR codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const openAddModal = () => {
    setEditingQr(null);
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setQrImageUrl("");
    setNotes("");
    setIsDefault(qrs.length === 0);
    setModalOpen(true);
  };

  const openEditModal = (qr: PaymentQrItem) => {
    setEditingQr(qr);
    setBankName(qr.bankName);
    setAccountName(qr.accountName);
    setAccountNumber(qr.accountNumber || "");
    setQrImageUrl(qr.qrImageUrl);
    setNotes(qr.notes || "");
    setIsDefault(qr.isDefault);
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setQrImageUrl(reader.result);
        toast.success("QR image loaded from file!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountName.trim() || !qrImageUrl.trim()) {
      toast.error("Please fill in bank name, account name, and QR image URL/file");
      return;
    }

    setSubmitting(true);
    try {
      if (editingQr) {
        // PATCH existing QR
        const res = await fetch(`/api/payment-qr/${editingQr.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankName: bankName.trim(),
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim() || "N/A",
            qrImageUrl: qrImageUrl.trim(),
            notes: notes.trim() || null,
            isDefault,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update QR code");

        toast.success(`Updated ${bankName} QR code!`);
      } else {
        // POST new QR
        const res = await fetch("/api/payment-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankName: bankName.trim(),
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim() || "N/A",
            qrImageUrl: qrImageUrl.trim(),
            notes: notes.trim() || null,
            isDefault: isDefault || qrs.length === 0,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create QR code");

        toast.success(`New ${bankName} QR code added!`);
      }

      setModalOpen(false);
      fetchQrs();
    } catch (err: any) {
      toast.error(err.message || "Failed to save QR code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (qr: PaymentQrItem) => {
    try {
      const res = await fetch(`/api/payment-qr/${qr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set default QR");

      toast.success(`${qr.bankName} set as default payment QR`);
      fetchQrs();
    } catch (err: any) {
      toast.error(err.message || "Failed to update default");
    }
  };

  const executeDeleteQr = async () => {
    if (!qrToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/payment-qr/${qrToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete QR code");

      toast.success(`${qrToDelete.bankName} QR deleted successfully!`);
      setQrToDelete(null);
      fetchQrs();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete QR code");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card dark:bg-[#080808] border border-border dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Payment Integrations
            </span>
            <span className="text-xs text-muted-foreground">• Fonepay / Banking QR</span>
          </div>
          <h1 className="text-2xl font-black text-foreground mt-2">
            Restaurant Payment QR Codes
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Manage, edit, or replace the QR codes shown to guests at tables and checkout for seamless cashless settlements across Fonepay, eSewa, and commercial banks.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Bank QR</span>
        </button>
      </div>

      {/* QR Codes Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading payment QR configurations...
        </div>
      ) : qrs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card dark:bg-[#080808] border border-dashed border-border dark:border-white/10 text-center space-y-3">
          <QrCode className="h-10 w-10 text-amber-500/60 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Payment QR Codes Configured</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Add your restaurant&apos;s Fonepay, eSewa, or Bank QR code so guests and cashiers can scan and settle bills immediately.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
          >
            <Plus className="h-4 w-4" /> Add First QR
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {qrs.map((qr) => (
            <div
              key={qr.id}
              className={`p-5 rounded-3xl bg-card dark:bg-[#080808] border flex flex-col items-center text-center space-y-3 relative transition-all shadow-md ${
                qr.isDefault
                  ? "border-amber-500/60 shadow-amber-500/5 ring-1 ring-amber-500/30"
                  : "border-border dark:border-white/10"
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between w-full">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
                {qr.isDefault ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Default Display
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(qr)}
                    className="text-[10px] font-medium text-muted-foreground hover:text-amber-400 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              {/* QR Image Preview Container */}
              <div className="w-52 h-52 rounded-2xl bg-white p-3 border-2 border-amber-500/30 shadow-inner flex items-center justify-center relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.qrImageUrl}
                  alt={`${qr.bankName} QR`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Bank & Account Details */}
              <div className="space-y-1 w-full pt-1">
                <h3 className="text-base font-extrabold text-foreground">{qr.bankName}</h3>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{qr.accountName}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  A/C: {qr.accountNumber || "N/A"}
                </p>
                {qr.notes && (
                  <p className="text-[11px] text-muted-foreground italic mt-1 line-clamp-2">
                    {qr.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-border dark:border-white/10">
                <button
                  type="button"
                  onClick={() => openEditModal(qr)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-secondary dark:bg-white/5 hover:bg-secondary/80 text-xs font-bold text-foreground border border-border dark:border-white/10 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5 text-amber-500" />
                  <span>Edit / Change</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrToDelete(qr)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-500 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete QR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-card dark:bg-[#0c0c0c] border border-border dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-black text-foreground">
                  {editingQr ? "Edit / Update Payment QR" : "Add New Payment QR"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Bank Presets (Only when adding) */}
            {!editingQr && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BANK_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBankName(p.name);
                        setAccountName(p.account);
                        setQrImageUrl(p.sampleUrl);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-secondary/80 hover:bg-amber-500/15 text-foreground hover:text-amber-500 border border-border transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveQr} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Bank / Payment Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fonepay / Global IME Bank / eSewa"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Account / Merchant Name (Payee) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRISHNA DURBAR RESTAURANT & BAR"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Account Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01010100987654321"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* QR Image URL or Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  QR Code Image *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Paste image URL (https://...)"
                    value={qrImageUrl}
                    onChange={(e) => setQrImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground border border-border cursor-pointer shrink-0">
                    <Upload className="h-3.5 w-3.5 text-amber-500" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Live Image Preview */}
              {qrImageUrl && (
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border dark:border-white/10 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white p-1 border border-amber-500/40 shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={() => toast.error("Could not load preview from image URL")}
                    />
                  </div>
                  <div className="text-xs space-y-0.5 overflow-hidden">
                    <p className="font-bold text-foreground">Preview Active</p>
                    <p className="text-[11px] text-muted-foreground truncate">{qrImageUrl}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Notes / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scan with Fonepay or mobile banking app"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background dark:bg-black border border-border dark:border-white/15 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultQrCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-border text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <label
                  htmlFor="defaultQrCheckbox"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Set as Primary / Default QR for Billing Counter
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingQr ? "Update QR Code" : "Save QR Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standard In-App Confirm Dialog for QR Deletion */}
      <ConfirmDialog
        isOpen={!!qrToDelete}
        title="Delete Payment QR Code?"
        message={`Are you sure you want to delete the ${qrToDelete?.bankName} QR code? It will no longer be available during bill settlement.`}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        variant="danger"
        isLoading={deleting}
        onConfirm={executeDeleteQr}
        onCancel={() => setQrToDelete(null)}
      />
    </div>
  );
}
