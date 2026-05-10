"use client";

import { motion } from "framer-motion";
import { RiskBreakdown } from "@/types";
import { cn } from "@/lib/utils";

interface RiskBreakdownChartProps {
  data: RiskBreakdown[];
}

function getBarStyle(score: number): { bar: string; text: string } {
  if (score <= 15) return { bar: "bg-emerald-500",  text: "text-emerald-400" };
  if (score <= 40) return { bar: "bg-amber-500",    text: "text-amber-400"   };
  if (score <= 70) return { bar: "bg-orange-500",   text: "text-orange-400"  };
  return              { bar: "bg-red-500",      text: "text-red-400"     };
}

export function RiskBreakdownChart({ data }: RiskBreakdownChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="px-6 py-5 space-y-5"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-medium">Risk Breakdown</p>

      <div className="space-y-4">
        {data.map((item, i) => {
          const { bar, text } = getBarStyle(item.score);
          const pct = (item.score / item.max) * 100;
          return (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-300">{item.category}</span>
                <span className={cn("text-xs font-medium tabular-nums", text)}>
                  {item.label}
                </span>
              </div>
              <div className="h-[3px] bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", bar)}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.05 * i, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
