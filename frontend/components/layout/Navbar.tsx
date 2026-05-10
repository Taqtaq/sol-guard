"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, ArrowLeft, Home } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Token Security Scanner" }: NavbarProps) {
  const router = useRouter();

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-800/50 bg-zinc-950 sticky top-0 z-30">
      {/* Left: back button + title */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all duration-150"
          whileHover={{ scale: 1.05, x: -1 }}
          whileTap={{ scale: 0.95 }}
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-500">Mainnet</span>
          </div>
        </div>
      </div>

      {/* Right: home + bell + wallet */}
      <div className="flex items-center gap-2">
        <motion.button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </motion.button>

        <Link href="/">
          <motion.button
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            title="Go to home"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </motion.button>
        </Link>

        <WalletButton />
      </div>
    </header>
  );
}
