"use client";

import { motion } from "framer-motion";
import { Search, Brain, Shield, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Paste Token Address",
    desc: "Enter any Solana token address or wallet into the scanner. No setup required.",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analyzes On-Chain Data",
    desc: "Our AI engine fetches holder data, authority info, liquidity, and transaction patterns from the blockchain.",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  {
    step: "03",
    icon: Shield,
    title: "Get Your Risk Report",
    desc: "Receive a comprehensive risk score with detailed explanations and actionable recommendations.",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 border-t border-zinc-900" id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
            Analysis in seconds
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Three simple steps to know if a token is safe before you invest.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4 lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.step} className="flex flex-col lg:flex-row items-center flex-1">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`flex-1 p-6 rounded-2xl border bg-zinc-950 ${step.border} hover:scale-[1.02] transition-transform duration-200 w-full`}
              >
                <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-4`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs font-mono text-zinc-600">{step.step}</span>
                  <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </motion.div>

              {i < STEPS.length - 1 && (
                <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90 lg:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
