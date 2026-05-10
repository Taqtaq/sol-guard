"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, TrendingUp, Coins } from "lucide-react";

const FEATURED_TOKENS = [
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    description: "Circle's regulated stablecoin. Fully audited, renounced authorities.",
    category: "Stablecoin",
    icon: "💵",
    expectation: "SAFE",
    color: "emerald",
  },
  {
    name: "Jupiter",
    symbol: "JUP",
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    description: "Solana's leading DEX aggregator governance token.",
    category: "DeFi",
    icon: "🪐",
    expectation: "LOW RISK",
    color: "blue",
  },
  {
    name: "BONK",
    symbol: "BONK",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    description: "Solana's first major community dog meme coin.",
    category: "Meme",
    icon: "🐕",
    expectation: "MEDIUM",
    color: "yellow",
  },
  {
    name: "Wrapped SOL",
    symbol: "wSOL",
    address: "So11111111111111111111111111111111111111112",
    description: "Native SOL wrapped as an SPL token for DeFi use.",
    category: "Native",
    icon: "◎",
    expectation: "SAFE",
    color: "purple",
  },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
};

const expectationColor: Record<string, string> = {
  "SAFE": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "LOW RISK": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "MEDIUM": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "HIGH RISK": "text-red-400 bg-red-500/10 border-red-500/20",
};

export function SocialProof() {
  return (
    <section className="py-24 px-4 border-t border-zinc-900" id="tokens">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">
              Try It Live
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-3">
              Scan real Solana tokens
            </h2>
            <p className="text-zinc-400 max-w-lg">
              Click any token below to instantly run a full AI security analysis with live on-chain data.
            </p>
          </div>
          <Link href="/dashboard">
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-emerald-500/40 hover:text-emerald-400 transition-all whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Scan any address
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_TOKENS.map((token, i) => (
            <motion.div
              key={token.address}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/dashboard?address=${token.address}`}>
                <motion.div
                  className="group relative h-full flex flex-col p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon + category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{token.icon}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorMap[token.color]}`}>
                      {token.category}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-zinc-100 text-sm">{token.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{token.symbol}</p>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-4">
                    {token.description}
                  </p>

                  {/* Expected result */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${expectationColor[token.expectation]}`}>
                      {token.expectation}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(52,211,153,0.15)" }} />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 grid grid-cols-3 divide-x divide-zinc-800 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden"
        >
          {[
            { icon: Shield, label: "Risk Signals Checked", value: "12+" },
            { icon: Coins, label: "Data Sources", value: "3 Live APIs" },
            { icon: TrendingUp, label: "Analysis Speed", value: "< 5 sec" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-6 py-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-base font-bold text-zinc-100">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
