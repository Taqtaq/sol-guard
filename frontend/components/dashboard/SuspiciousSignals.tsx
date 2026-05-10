"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";
import { SuspiciousSignal } from "@/types";
import { cn } from "@/lib/utils";

interface SuspiciousSignalsProps {
  signals: SuspiciousSignal[];
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertCircle,
    border: "border-red-500/25",
    bg: "bg-red-500/5",
    iconColor: "text-red-400",
    labelColor: "text-red-400",
    labelBg: "bg-red-500/10 border-red-500/25",
    glow: "shadow-red-500/10",
    pulse: true,
  },
  HIGH: {
    icon: AlertTriangle,
    border: "border-orange-500/25",
    bg: "bg-orange-500/5",
    iconColor: "text-orange-400",
    labelColor: "text-orange-400",
    labelBg: "bg-orange-500/10 border-orange-500/25",
    glow: "shadow-orange-500/10",
    pulse: false,
  },
  MEDIUM: {
    icon: AlertTriangle,
    border: "border-amber-500/20",
    bg: "bg-amber-500/4",
    iconColor: "text-amber-400",
    labelColor: "text-amber-400",
    labelBg: "bg-amber-500/10 border-amber-500/20",
    glow: "",
    pulse: false,
  },
  LOW: {
    icon: Info,
    border: "border-zinc-700/60",
    bg: "bg-zinc-900/40",
    iconColor: "text-zinc-400",
    labelColor: "text-zinc-400",
    labelBg: "bg-zinc-800 border-zinc-700",
    glow: "",
    pulse: false,
  },
};

export function SuspiciousSignals({ signals }: SuspiciousSignalsProps) {
  const critical = signals.filter((s) => s.severity === "CRITICAL");
  const rest = signals.filter((s) => s.severity !== "CRITICAL");
  const ordered = [...critical, ...rest];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="px-6 py-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <p className="text-sm font-medium text-zinc-100">Threat Signals</p>
        </div>
        <span className="text-xs text-zinc-500">
          {signals.length} signal{signals.length !== 1 ? "s" : ""} detected
        </span>
      </div>

      {/* Signals */}
      <div className="space-y-3">
        {ordered.map((signal, i) => {
          const cfg = SEVERITY_CONFIG[signal.severity];
          const Icon = cfg.icon;

          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className={cn(
                "relative flex gap-4 p-4 rounded-xl border shadow-lg",
                cfg.border, cfg.bg, cfg.glow
              )}
            >
              {/* Left accent bar */}
              <div className={cn(
                "absolute left-0 top-3 bottom-3 w-[3px] rounded-full",
                signal.severity === "CRITICAL" ? "bg-red-500" :
                signal.severity === "HIGH" ? "bg-orange-500" :
                signal.severity === "MEDIUM" ? "bg-amber-500" : "bg-zinc-600"
              )} />

              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5 pl-1">
                {cfg.pulse ? (
                  <div className="relative">
                    <Icon className={cn("w-4 h-4", cfg.iconColor)} />
                    <motion.div
                      className="absolute -inset-1.5 rounded-full bg-red-500/20"
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                ) : (
                  <Icon className={cn("w-4 h-4", cfg.iconColor)} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <p className="text-sm font-medium text-zinc-100 leading-snug">
                    {signal.title}
                  </p>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 tracking-wide",
                    cfg.labelBg, cfg.labelColor
                  )}>
                    {signal.severity}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {signal.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
