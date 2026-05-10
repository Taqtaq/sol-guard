"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-zinc-800/60 bg-black/90 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto w-full h-full flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-zinc-100">
            SolGuard <span className="text-emerald-400">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            How it works
          </a>
          <a href="#tokens" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Token Scanner
          </a>
        </div>

        <div className="flex items-center gap-3">
          <WalletButton variant="compact" />
        </div>
      </div>
    </motion.nav>
  );
}
