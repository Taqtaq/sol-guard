"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AnalysisStep } from "@/types";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  step: AnalysisStep;
  stepLabel: string;
  progress: number;
}

const STEPS_LIST = [
  { id: "fetching", label: "Fetching on-chain data" },
  { id: "analyzing", label: "Analyzing holder distribution" },
  { id: "generating", label: "Generating AI security report" },
  { id: "complete", label: "Analysis complete" },
];

const ORDER = ["fetching", "analyzing", "generating", "complete"];

function getStepStatus(currentStep: string, itemId: string) {
  const currentIdx = ORDER.indexOf(currentStep);
  const itemIdx = ORDER.indexOf(itemId);
  if (itemIdx < currentIdx) return "done";
  if (itemIdx === currentIdx) return "active";
  return "pending";
}

export function LoadingState({ step, stepLabel, progress }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      {/* Animated scanner */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-zinc-800 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-500/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald-500/20"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
      </div>

      {/* Label */}
      <motion.p
        key={stepLabel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-emerald-400 font-medium mb-6"
      >
        {stepLabel}
      </motion.p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <Progress
          value={progress}
          className="h-1.5 bg-zinc-800 [&>[data-slot=progress-indicator]]:bg-emerald-500"
        />
        <p className="text-xs text-zinc-600 mt-1.5 text-right">{progress}%</p>
      </div>

      {/* Step list */}
      <div className="space-y-2 w-full max-w-xs">
        {STEPS_LIST.map((s) => {
          const status = getStepStatus(step, s.id);
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  status === "done"
                    ? "bg-emerald-500/20"
                    : status === "active"
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/50"
                    : "bg-zinc-900"
                )}
              >
                {status === "done" ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                ) : status === "active" ? (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs transition-colors duration-200",
                  status === "done"
                    ? "text-zinc-500 line-through"
                    : status === "active"
                    ? "text-zinc-200"
                    : "text-zinc-600"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
