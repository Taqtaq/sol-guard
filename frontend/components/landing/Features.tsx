"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Wallet,
  Activity,
  Lock,
  Search,
  Zap,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: Lock,
    title: "Mint Authority Detection",
    desc: "Instantly identify if developers retain the ability to mint unlimited tokens, a critical rug pull vector.",
    color: "text-red-400",
    bg: "bg-red-500/5 border-red-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Freeze Authority Check",
    desc: "Detect whether any authority can freeze your token account and prevent you from selling.",
    color: "text-orange-400",
    bg: "bg-orange-500/5 border-orange-500/20",
  },
  {
    icon: BarChart3,
    title: "Holder Distribution Analysis",
    desc: "Visualize supply concentration. Centralized ownership is the #1 warning sign for exit scams.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/5 border-yellow-500/20",
  },
  {
    icon: Activity,
    title: "Wash Trading Detection",
    desc: "Identify artificial volume created by coordinated circular trading between related wallets.",
    color: "text-blue-400",
    bg: "bg-blue-500/5 border-blue-500/20",
  },
  {
    icon: Wallet,
    title: "Wallet Reputation Scoring",
    desc: "Cross-reference wallet addresses with known scam databases and suspicious activity patterns.",
    color: "text-purple-400",
    bg: "bg-purple-500/5 border-purple-500/20",
  },
  {
    icon: Zap,
    title: "AI Risk Explanation",
    desc: "Get plain-English explanations of exactly why a token is risky, powered by advanced AI analysis.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5 border-emerald-500/20",
  },
  {
    icon: Search,
    title: "Liquidity Analysis",
    desc: "Assess liquidity depth and concentration. Thin liquidity allows insiders to exit without price impact.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/5 border-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Real-Time Monitoring",
    desc: "Set alerts for suspicious on-chain activity across tokens and wallets you're watching.",
    color: "text-zinc-400",
    bg: "bg-zinc-800/40 border-zinc-700/30",
    badge: "Coming Soon",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Features() {
  return (
    <section className="py-24 px-4" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">
            Detection Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
            Every signal that matters
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            SolGuard AI analyzes dozens of on-chain signals to build a comprehensive risk profile for any token or wallet.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className={`relative p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] cursor-default ${f.bg}`}
            >
              {f.badge && (
                <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-500">
                  {f.badge}
                </span>
              )}
              <div className={`mb-3 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
