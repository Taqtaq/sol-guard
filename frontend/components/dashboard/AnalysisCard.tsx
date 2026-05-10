"use client";

import { motion } from "framer-motion";
import {
  Copy,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { AnalysisReport, SuspiciousSignal, WalletActivity } from "@/types";
import { cn, formatAddress, formatUSD } from "@/lib/utils";
import { toast } from "sonner";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };
  return (
    <button
      onClick={copy}
      className="text-zinc-600 hover:text-zinc-400 transition-colors"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function AuthorityBadge({ value }: { value: string | null }) {
  if (!value) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span className="text-xs text-emerald-400 font-medium">Renounced</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
      <XCircle className="w-3 h-3 text-red-400" />
      <span className="text-xs text-red-400 font-mono">{formatAddress(value)}</span>
    </div>
  );
}

function SignalIcon({ type }: { type: SuspiciousSignal["type"] }) {
  switch (type) {
    case "danger": return <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />;
    case "info": return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
  }
}

function SignalCard({ signal }: { signal: SuspiciousSignal }) {
  const borderColor =
    signal.type === "danger" ? "border-red-500/20 bg-red-500/5" :
    signal.type === "warning" ? "border-orange-500/20 bg-orange-500/5" :
    "border-blue-500/20 bg-blue-500/5";

  const severityColor =
    signal.severity === "CRITICAL" ? "text-red-400 bg-red-500/10 border-red-500/20" :
    signal.severity === "HIGH" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
    signal.severity === "MEDIUM" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
    "text-blue-400 bg-blue-500/10 border-blue-500/20";

  return (
    <div className={cn("flex gap-3 p-3.5 rounded-xl border", borderColor)}>
      <SignalIcon type={signal.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-zinc-200">{signal.title}</p>
          <span className={cn("text-xs px-1.5 py-0.5 rounded border", severityColor)}>
            {signal.severity}
          </span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{signal.description}</p>
      </div>
    </div>
  );
}

interface AnalysisCardProps {
  report: AnalysisReport;
}

export function TokenMetadataCard({ report }: AnalysisCardProps) {
  const { tokenMetadata: m } = report;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Token Metadata</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Name</span>
          <span className="text-xs font-medium text-zinc-200">{m.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Symbol</span>
          <span className="text-xs font-mono text-zinc-200">{m.symbol}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-500">Address</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-400">{formatAddress(m.address)}</span>
            <CopyButton text={m.address} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Total Supply</span>
          <span className="text-xs font-mono text-zinc-200">{m.supply}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Decimals</span>
          <span className="text-xs font-mono text-zinc-200">{m.decimals}</span>
        </div>

        <div className="pt-2 border-t border-zinc-800/60">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <span className="text-xs text-zinc-500 mt-1">Mint Authority</span>
            <AuthorityBadge value={m.mintAuthority} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs text-zinc-500 mt-1">Freeze Authority</span>
            <AuthorityBadge value={m.freezeAuthority} />
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800/60 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Liquidity</p>
            <p className="text-sm font-semibold text-zinc-200">{formatUSD(report.liquidityUSD)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Market Cap</p>
            <p className="text-sm font-semibold text-zinc-200">{formatUSD(report.marketCapUSD)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SuspiciousSignalsCard({ report }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">Suspicious Signals</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
          {report.suspiciousSignals.length} detected
        </span>
      </div>
      <div className="space-y-2.5">
        {report.suspiciousSignals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </motion.div>
  );
}

export function WalletActivityCard({ report }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Top Wallet Activity</h3>
      <div className="space-y-2.5">
        {report.walletActivity.map((wallet, i) => (
          <WalletRow key={wallet.address} wallet={wallet} rank={i + 1} />
        ))}
      </div>
    </motion.div>
  );
}

function WalletRow({ wallet, rank }: { wallet: WalletActivity; rank: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border",
        wallet.isSuspicious
          ? "border-red-500/20 bg-red-500/5"
          : "border-zinc-800 bg-zinc-900/40"
      )}
    >
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          wallet.isSuspicious ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400"
        )}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-zinc-200 truncate">{wallet.label}</p>
          {wallet.isSuspicious && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex-shrink-0">
              Suspicious
            </span>
          )}
        </div>
        <p className="text-xs font-mono text-zinc-500 mt-0.5">{wallet.address}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold text-zinc-200">{wallet.percentage}%</p>
        <p className="text-xs text-zinc-600">{wallet.transactions} txns</p>
      </div>
    </div>
  );
}
