"use client";

import React, { useState, useEffect } from "react";
import { X, QrCode, Building, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentQrModal({ isOpen, onClose }: PaymentQrModalProps) {
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/payment-qr")
        .then((res) => res.json())
        .then((data) => {
          if (data?.qrs) setQrs(data.qrs);
        })
        .catch(() => toast.error("Failed to load QR code"))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultQr = qrs.find((q) => q.isDefault) || qrs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-durbar-dark border border-amber-500/40 p-6 text-center shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <QrCode className="h-5 w-5" />
          </div>
          <h3 className="text-base font-black text-amber-200">Scan to Pay</h3>
          <p className="text-xs text-slate-400">Trishna Durbar Restaurant & Bar</p>
        </div>

        {/* QR Code Container */}
        <div className="mx-auto w-56 h-56 rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center border-4 border-amber-500/30">
          {defaultQr?.qrImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={defaultQr.qrImageUrl}
              alt="Payment QR"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-slate-500 text-xs">No QR Code Available</div>
          )}
        </div>

        {/* Bank & Account Info */}
        {defaultQr && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-bold text-amber-300">
              <Building className="h-3.5 w-3.5" />
              <span>{defaultQr.bankName}</span>
            </div>
            <p className="text-slate-300 font-semibold">{defaultQr.accountName}</p>
            <p className="font-mono text-slate-400 text-[11px]">
              A/C: {defaultQr.accountNumber}
            </p>
          </div>
        )}

        <p className="text-[11px] text-amber-400/80 font-medium">
          Accepts Fonepay, eSewa, Khalti & All Nepali Banking Apps
        </p>
      </div>
    </div>
  );
}
