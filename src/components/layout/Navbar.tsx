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
  Moon,
  Sun,
  Menu as MenuIcon,
  X,
  Sparkles,
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
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Royal Admin";
      case "ADMIN":
        return "Manager";
      case "CASHIER":
        return "Cashier POS";
      case "WAITER":
        return "Floor Service";
      case "KITCHEN":
        return "Master Chef";
      default:
        return role;
    }
  };

  const navItems = [
    { href: "/", label: "Floor POS Matrix", icon: LayoutGrid },
    { href: "/menu", label: "Menu & Bar Catalog", icon: BookOpen },
    { href: "/expenses", label: "Expenses & Outflows", icon: Receipt },
    { href: "/analytics", label: "Analytics & P&L", icon: BarChart3 },
    { href: "/payment-qr", label: "Payment QR", icon: QrCode },
    { href: "/audit-logs", label: "Audit Trail", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/25 bg-background/95 dark:bg-[#090806]/95 backdrop-blur-xl shadow-xs transition-colors duration-200">
      {/* Top Royal Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2">
        {/* Brand Logo with Royal Crest */}
        <Link href="/" className="group transition-transform active:scale-95">
          <RoyalDurbarLogo size="md" />
        </Link>

        {/* Live Nepal Time (Desktop Royal Pill) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-foreground shadow-xs">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-mono font-bold">{nepalTime || "Kathmandu Time"}</span>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-bold uppercase tracking-wider">
            (NST)
          </span>
        </div>

        {/* User Identity, Theme Toggle & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-secondary/80 dark:bg-[#15120c] border border-amber-500/35 shadow-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
              <div className="text-left">
                <p className="text-[11px] font-black text-foreground leading-tight">{user.name}</p>
                <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 tracking-wide">
                  👑 {getRoleBadge(user.role)}
                </p>
              </div>
            </div>
          )}

          {/* Tactile 3D Theme Switcher */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-amber-500/40 text-foreground transition-all active:translate-y-0.5 shadow-xs"
              title="Toggle Light / Dark Palace Mode"
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
            type="button"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all active:translate-y-0.5"
            title="End Session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl bg-secondary border border-border text-foreground active:scale-95"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Segmented Navigation Ribbon */}
      <nav className="hidden sm:block border-t border-amber-500/15 bg-card/60 dark:bg-[#0c0a07]/80 px-3 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 py-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 border ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-[0_2px_8px_rgba(245,158,11,0.25)] font-black"
                    : "text-foreground/80 hover:text-foreground bg-transparent border-transparent hover:border-amber-500/30 hover:bg-amber-500/5"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-slate-950" : "text-amber-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-amber-500/20 bg-card dark:bg-[#0d0b07] p-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          <div className="pb-2 border-b border-border text-xs text-muted-foreground flex items-center justify-between">
            <span className="font-mono font-bold">{nepalTime}</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">NST Kathmandu</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm"
                      : "text-foreground hover:bg-secondary border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 text-amber-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            <span>End Session (Logout)</span>
          </button>
        </div>
      )}
    </header>
  );
}
