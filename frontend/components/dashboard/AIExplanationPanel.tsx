"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AIExplanationPanelProps {
  summary: string;
}

export function AIExplanationPanel({ summary }: AIExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col gap-4 p-6"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 tracking-wide">AI Analysis</span>
        </div>
      </div>

      <p className="text-[15px] text-zinc-300 leading-[1.75] font-light">
        {summary}
      </p>
    </motion.div>
  );
}
