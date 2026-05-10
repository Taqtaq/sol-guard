"use client";

import { motion } from "framer-motion";
import { RefreshCw, Clock, Copy, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { AnalysisReport as Report } from "@/types";
import { RiskCard } from "./RiskCard";
import { AIExplanationPanel } from "./AIExplanationPanel";
import { SuspiciousSignals } from "./SuspiciousSignals";
import { RiskBreakdownChart } from "@/components/charts/RiskBreakdownChart";
import { formatAddress, formatUSD, cn } from "@/lib/utils";
import { toast } from "sonner";

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        toast.success("Copied");
        setTimeout(() => setDone(false), 2000);
      }}
      className="text-zinc-700 hover:text-zinc-400 transition-colors"
    >
      {done
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
}

function AuthBadge({ value }: { value: string | null }) {
  return value ? (
    <div className="flex items-center gap-1.5 text-red-400">
      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-mono truncate max-w-[120px]">{formatAddress(value)}</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-emerald-400">
      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs">Renounced</span>
    </div>
  );
}

interface AnalysisReportProps {
  report: Report;
  onReset: () => void;
}

export function AnalysisReport({ report, onReset }: AnalysisReportProps) {
  const m = report.tokenMetadata;
  const time = new Date(report.analyzedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Report bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Clock className="w-3 h-3" />
          <span>Analyzed at {time}</span>
          <span className="text-zinc-800">·</span>
          <span className="font-mono">{formatAddress(report.tokenAddress)}</span>
        </div>
        <motion.button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCw className="w-3 h-3" />
          New Scan
        </motion.button>
      </div>

      {/* ── Row 1: Risk Score + AI Analysis ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 rounded-2xl bg-zinc-950 border border-zinc-800/60 overflow-hidden">
        {/* Risk Score */}
        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-zinc-800/60 relative flex items-center justify-center">
          <RiskCard
            score={report.riskScore}
            level={report.riskLevel}
            status={report.status}
          />
        </div>

        {/* AI Analysis */}
        <div className="md:col-span-3 flex flex-col">
          <AIExplanationPanel summary={report.aiSummary} />

          {/* Token quick-stats */}
          <div className="mx-6 mt-auto mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Symbol",    value: m.symbol },
              { label: "Supply",    value: m.supply },
              { label: "Liquidity", value: formatUSD(report.liquidityUSD) },
              { label: "Market Cap",value: formatUSD(report.marketCapUSD) },
            ].map((s) => (
              <div key={s.label} className="px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">{s.label}</p>
                <p className="text-sm font-medium text-zinc-200 truncate">{s.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Risk Breakdown + Token Metadata ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Risk Breakdown */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/60">
          <RiskBreakdownChart data={report.riskBreakdown} />
        </div>

        {/* Token Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-zinc-950 border border-zinc-800/60 px-6 py-5"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-medium mb-5">Token Metadata</p>
          <div className="space-y-3.5">
            {[
              { label: "Name",     value: m.name },
              { label: "Address",  value: formatAddress(m.address), copy: m.address },
              { label: "Decimals", value: String(m.decimals) },
              { label: "Network",  value: "Solana Mainnet" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-xs font-medium",
                    row.label === "Address" ? "font-mono text-zinc-400" : "text-zinc-300"
                  )}>
                    {row.value}
                  </span>
                  {row.copy && <CopyBtn text={row.copy} />}
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-zinc-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">Mint Authority</span>
                <AuthBadge value={m.mintAuthority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">Freeze Authority</span>
                <AuthBadge value={m.freezeAuthority} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Row 3: Suspicious Signals (hero) ── */}
      {report.suspiciousSignals.length > 0 && (
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/60">
          <SuspiciousSignals signals={report.suspiciousSignals} />
        </div>
      )}
    </motion.div>
  );
}
