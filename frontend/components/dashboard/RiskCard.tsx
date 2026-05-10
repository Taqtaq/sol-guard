"use client";

import { motion } from "framer-motion";
import { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

interface RiskCardProps {
  score: number;
  level: RiskLevel;
  status: string;
}

function getRiskPalette(level: RiskLevel) {
  switch (level) {
    case "LOW":     return { stroke: "#10b981", glow: "rgba(16,185,129,0.25)", text: "text-emerald-400", label: "text-emerald-400", bg: "bg-emerald-500/5" };
    case "MEDIUM":  return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.25)",  text: "text-amber-400",   label: "text-amber-400",   bg: "bg-amber-500/5"  };
    case "HIGH":    return { stroke: "#ef4444", glow: "rgba(239,68,68,0.3)",    text: "text-red-400",     label: "text-red-400",     bg: "bg-red-500/5"    };
    case "CRITICAL":return { stroke: "#ef4444", glow: "rgba(239,68,68,0.4)",    text: "text-red-400",     label: "text-red-400",     bg: "bg-red-500/5"    };
  }
}

const R = 80;
const CIRC = 2 * Math.PI * R;

export function RiskCard({ score, level, status }: RiskCardProps) {
  const pal = getRiskPalette(level);
  const offset = CIRC - (score / 100) * CIRC;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-10 px-6"
    >
      {/* Circular progress */}
      <div className="relative mb-6" style={{ filter: `drop-shadow(0 0 24px ${pal.glow})` }}>
        <svg width="200" height="200" className="-rotate-90">
          {/* Track */}
          <circle cx="100" cy="100" r={R} fill="none" stroke="#1f1f23" strokeWidth="6" />
          {/* Progress */}
          <motion.circle
            cx="100" cy="100" r={R}
            fill="none"
            stroke={pal.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* Score overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("text-6xl font-bold tabular-nums leading-none", pal.text)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-zinc-600 mt-1 tracking-widest uppercase">/ 100</span>
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <p className="text-xs text-zinc-600 uppercase tracking-[0.2em] mb-2">Risk Score</p>
        <span className={cn(
          "text-sm font-semibold px-4 py-1.5 rounded-full border",
          level === "LOW"  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/8" :
          level === "MEDIUM" ? "border-amber-500/30 text-amber-400 bg-amber-500/8" :
          "border-red-500/30 text-red-400 bg-red-500/8"
        )}>
          {status}
        </span>
      </motion.div>

      {/* Animated ring pulse for high risk */}
      {(level === "HIGH" || level === "CRITICAL") && (
        <motion.div
          className="absolute w-48 h-48 rounded-full border border-red-500/20 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
