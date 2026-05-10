"use client";

import Link from "next/link";
import { Shield, ExternalLink, Zap } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
  ],
  Resources: [
    { label: "Solana Docs", href: "https://docs.solana.com" },
    { label: "Jupiter", href: "https://jup.ag" },
    { label: "DexScreener", href: "https://dexscreener.com" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-zinc-100">
                SolGuard <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              AI-powered security intelligence for the Solana ecosystem. Detect scams before they cost you.
            </p>
            <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 w-fit">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">AI Engine Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">{group}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 group"
                    >
                      {item.label}
                      {item.href.startsWith("http") && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © 2024 SolGuard AI · Built for Solana Hackathon
          </p>
          <p className="text-xs text-zinc-700">
            Not financial advice · Demo MVP · Use at your own risk
          </p>
        </div>
      </div>
    </footer>
  );
}
