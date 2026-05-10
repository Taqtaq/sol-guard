"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Search,
  Activity,
  Bell,
  Settings,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Token Scan", href: "/dashboard" },
  { icon: Activity, label: "Live Feed", href: "/dashboard", badge: "Soon" },
  { icon: Bell, label: "Alerts", href: "/dashboard", badge: "Soon" },
  { icon: Settings, label: "Settings", href: "/dashboard", badge: "Soon" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800/50",
        className
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-sm text-zinc-100">SolGuard</span>
          <span className="font-bold text-sm text-emerald-400"> AI</span>
        </div>
      </Link>

      {/* AI Engine Badge */}
      <div className="mx-4 mt-4 mb-2">
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
          animate={{ borderColor: ["rgba(52,211,153,0.2)", "rgba(52,211,153,0.4)", "rgba(52,211,153,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">AI Engine Active</span>
          <div className="ml-auto flex gap-0.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="w-0.5 h-3 rounded-full bg-emerald-400"
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href && item.href === "/dashboard";
          return (
            <Link key={item.label} href={item.href}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                  isActive && item.label === "Dashboard"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                )}
                whileHover={{ x: 2 }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
                    {item.badge}
                  </span>
                ) : (
                  isActive && item.label === "Dashboard" && (
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  )
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-600">v0.1.0 · MVP Demo</p>
        <p className="text-xs text-zinc-700 mt-0.5">Solana Mainnet</p>
      </div>
    </aside>
  );
}
