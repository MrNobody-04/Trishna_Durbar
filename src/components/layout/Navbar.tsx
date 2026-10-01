"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  BookOpen,
  Receipt,
  BarChart3,
  QrCode,
  ShieldCheck,
  LogOut,
  Clock,
  Crown,
  Moon,
  Sun,
  Menu as MenuIcon,
  X,
  Layers,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { SessionUser } from "@/types";
import { RoyalDurbarLogo } from "@/components/ui/RoyalDurbarLogo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [nepalTime, setNepalTime] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch current user
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    // Live Nepal Time Clock
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(now);
      setNepalTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard & Floor Matrix", icon: LayoutGrid },
    { href: "/menu", label: "Menu Catalog", icon: BookOpen },
    { href: "/expenses", label: "Expenses Outflows", icon: Receipt },
    { href: "/analytics", label: "Financial Analytics", icon: BarChart3 },
    { href: "/payment-qr", label: "Payment QR", icon: QrCode },
    { href: "/audit-logs", label: "Audit Trail", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 dark:bg-durbar-dark/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Brand Logo */}
        <Link href="/" className="group">
          <RoyalDurbarLogo size="md" />
        </Link>

        {/* Live Nepal Time (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-xs text-foreground">
          <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span className="font-mono">{nepalTime || "Loading Nepal Time..."}</span>
          <span className="text-[10px] text-muted-foreground font-semibold">(NST UTC+5:45)</span>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-foreground leading-none">{user.name}</p>
                <p className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 tracking-wider">
                  [{user.role}]
                </p>
              </div>
            </div>
          )}

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-amber-600" />
              )}
            </button>
          )}

          {/* Logout Button (Desktop) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl bg-secondary border border-border text-foreground"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sub-Navigation Bar */}
      <nav className="hidden sm:block border-t border-border bg-card/60 dark:bg-durbar-card/40 px-3 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 py-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20"
                    : "text-foreground/80 hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 border-b border-border text-xs text-muted-foreground flex items-center justify-between">
            <span className="font-mono">{nepalTime}</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">NST UTC+5:45</span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4 text-amber-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 mt-2 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      )}
    </header>
  );
}
