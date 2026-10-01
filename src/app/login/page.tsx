"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { RoyalDurbarLogo } from "@/components/ui/RoyalDurbarLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("td_staff_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {}
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your staff email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      try {
        localStorage.setItem("td_staff_email", email.trim().toLowerCase());
      } catch {}

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-4 px-3 w-full max-w-full overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="relative rounded-3xl bg-card border border-border p-5 sm:p-8 shadow-2xl transition-colors duration-200 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 relative flex flex-col items-center">
            <RoyalDurbarLogo size="lg" showText={false} />
            <h1 className="text-2xl font-black tracking-wider text-foreground">
              TRISHNA DURBAR
            </h1>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              तृष्णा दरबार रेष्टुरेन्ट एण्ड बार
            </p>
            <p className="text-xs text-muted-foreground">
              Staff & Management Portal
            </p>
          </div>

          {/* Secure Production Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@trishnadurbar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 shadow-md shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Professional Footer */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground text-center">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            <span>Authorized Staff Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
