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
  ClipboardList,
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

  const isAuth = Boolean(user && pathname !== "/login");

  useEffect(() => {
    setMounted(true);
    if (pathname === "/login") {
      setUser(null);
      return;
    }
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => {
        setUser(null);
      });

    const updateTime = () => {
      try {
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
      } catch {
        try {
          setNepalTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        } catch {
          setNepalTime("");
        }
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setUser(null);
      setMobileMenuOpen(false);
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "OWNER":
      case "SUPER_ADMIN":
        return "Royal Owner";
      case "MANAGER":
      case "ADMIN":
        return "Manager";
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

  const navItems = [
    { href: "/", label: "Order", icon: LayoutGrid },
    { href: "/orders", label: "Order History", icon: ClipboardList },
    { href: "/menu", label: "Menu & Bar Catalog", icon: BookOpen },
    { href: "/expenses", label: "Expenses & Outflows", icon: Receipt },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/payment-qr", label: "Payment QR", icon: QrCode },
    { href: "/audit-logs", label: "Audit Trail", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/25 bg-background/95 dark:bg-[#090806]/95 backdrop-blur-xl shadow-xs transition-colors duration-200">
      {/* Top Royal Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2">
        {/* Brand Logo with Royal Crest */}
        <Link href={isAuth ? "/" : "/login"} className="group transition-transform active:scale-95">
          <RoyalDurbarLogo size="md" />
        </Link>

        {/* Theme Toggle & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

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

          {/* Logout Button (Desktop) - Only show when authenticated */}
          {isAuth && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all active:translate-y-0.5"
              title="End Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          )}

          {/* Mobile Menu Hamburger - Only show when authenticated */}
          {isAuth && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl bg-secondary border border-border text-foreground active:scale-95"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Desktop Segmented Navigation Ribbon - Only visible when authenticated */}
      {isAuth && (
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
      )}

      {/* Mobile Drawer Menu - Only visible when authenticated */}
      {isAuth && mobileMenuOpen && (
        <div className="sm:hidden border-t border-amber-500/20 bg-card dark:bg-[#0d0b07] p-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          {/* User Profile Card on Mobile */}
          {user && (
            <div className="p-3 rounded-2xl bg-secondary/80 dark:bg-white/[0.04] border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">{user.name || "Staff"}</p>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    👑 {getRoleBadge(user.role)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </div>
            </div>
          )}

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
