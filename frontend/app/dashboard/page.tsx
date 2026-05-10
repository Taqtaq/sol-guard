"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  Cpu,
  Loader2,
  Menu,
  Radar,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import type { NftRisk, RiskFlag, RiskLevel, ScannedAsset, ScoreHistoryPoint, SecurityAlert } from "@shared/types";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useWalletRiskScan } from "@/hooks/useWalletRiskScan";
import { cn, formatAddress } from "@/lib/utils";

const riskClasses: Record<RiskLevel, string> = {
  SAFE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-300",
};

const scanPhrases = [
  "Analyzing token authority...",
  "Checking liquidity health...",
  "Inspecting whale concentration...",
  "Building AI risk profile...",
  "Scanning suspicious metadata...",
  "Monitoring contract behavior...",
  "Separating evidence from unavailable data...",
  "Generating deterministic explanation...",
];

const verdictStyles = {
  SAFE: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200 shadow-emerald-500/20",
  CAUTION: "border-amber-400/40 bg-amber-500/10 text-amber-200 shadow-amber-500/20",
  "HIGH RISK": "border-orange-400/40 bg-orange-500/10 text-orange-200 shadow-orange-500/20",
  AVOID: "border-red-400/40 bg-red-500/10 text-red-200 shadow-red-500/20",
};

type Verdict = keyof typeof verdictStyles;

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("rounded-md border px-2 py-1 text-xs font-semibold", riskClasses[level])}>
      {level}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/90 px-4 py-3 shadow-[0_0_30px_rgba(16,185,129,0.03)] transition-colors hover:border-emerald-500/30">
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function AiScanEngine({ active, mode }: { active: boolean; mode: string }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!active) {
      const timer = setTimeout(() => setProgress(100), 0);
      return () => clearTimeout(timer);
    }
    const phraseTimer = setInterval(() => setIndex((value) => (value + 1) % scanPhrases.length), 1200);
    const progressTimer = setInterval(() => setProgress((value) => (value >= 92 ? 24 : value + 9)), 520);
    return () => {
      clearInterval(phraseTimer);
      clearInterval(progressTimer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-emerald-500/20 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(9,9,11,0.98),rgba(24,24,27,0.88))] p-4 shadow-[0_0_45px_rgba(16,185,129,0.12)]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <motion.div
            className="absolute inset-1 rounded-full border border-dashed border-emerald-300/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute h-20 w-20 rounded-full border border-emerald-400/10"
            animate={{ scale: [0.85, 1.18, 0.85], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <Brain className="h-7 w-7 text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">AI Engine Active</p>
            <span className="rounded border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">{mode}</span>
          </div>
          <motion.p
            key={scanPhrases[index]}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-mono text-sm text-zinc-200"
          >
            {scanPhrases[index]}<span className="animate-pulse text-emerald-300">_</span>
          </motion.p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-300 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {["RPC", "DEX", "AUTH"].map((item, itemIndex) => (
            <motion.div
              key={item}
              className="rounded-lg border border-zinc-800 bg-black/35 px-3 py-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: itemIndex * 0.25 }}
            >
              <Radar className="mx-auto h-4 w-4 text-emerald-300" />
              <p className="mt-1 text-[10px] text-zinc-500">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FlagList({ flags }: { flags: RiskFlag[] }) {
  return (
    <div className="space-y-2">
      {flags.map((flag) => (
        <div key={flag.id} className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-zinc-200">{flag.label}</p>
            <RiskBadge level={flag.severity} />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{flag.explanation}</p>
        </div>
      ))}
    </div>
  );
}

function AlertsPanel({ alerts }: { alerts: SecurityAlert[] }) {
  return (
    <div className="space-y-3">
      {alerts.length === 0 && <p className="text-sm text-zinc-500">No high-priority alerts yet.</p>}
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-lg border border-zinc-800 bg-black/40 px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-100">{alert.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{new Date(alert.timestamp).toLocaleTimeString()}</p>
            </div>
            <RiskBadge level={alert.severity} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{alert.explanation}</p>
          {alert.mintAddress && (
            <p className="mt-2 font-mono text-xs text-zinc-600">{alert.mintAddress}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ScoreTimeline({ history }: { history: ScoreHistoryPoint[] }) {
  const visible = history.slice(-8);
  return (
    <div className="space-y-3">
      {visible.length === 0 && <p className="text-sm text-zinc-500">Score history appears after wallet scans.</p>}
      <div className="flex h-28 items-end gap-2">
        {visible.map((point) => (
          <div key={point.scannedAt} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t bg-emerald-500/70" style={{ height: `${Math.max(8, point.walletSafetyScore)}%` }} />
            <span className="text-[10px] text-zinc-600">{point.walletSafetyScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NftRiskPanel({ nftRisks }: { nftRisks: NftRisk[] }) {
  return (
    <div className="space-y-3">
      {nftRisks.length === 0 && <p className="text-sm text-zinc-500">No NFT-only risks found. Add Helius for richer NFT spam detection.</p>}
      {nftRisks.slice(0, 6).map((nft) => (
        <div key={nft.mintAddress} className="rounded-lg border border-zinc-800 bg-black/40 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-100">{nft.name}</p>
              <p className="font-mono text-xs text-zinc-600">{formatAddress(nft.mintAddress)}</p>
            </div>
            <RiskBadge level={nft.riskLevel} />
          </div>
          <div className="mt-3">
            <FlagList flags={nft.riskFlags.slice(0, 2)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function getVerdict(score: number): Verdict {
  if (score >= 80) return "AVOID";
  if (score >= 55) return "HIGH RISK";
  if (score >= 25) return "CAUTION";
  return "SAFE";
}

function confidenceForAsset(asset: ScannedAsset) {
  const checks = [
    asset.metadataStatus !== "unknown",
    asset.evidence.liquidityUSD !== null && asset.evidence.liquidityUSD !== undefined,
    asset.evidence.topHolderPercent !== null && asset.evidence.topHolderPercent !== undefined,
    asset.evidence.mintAuthority !== undefined,
    asset.evidence.freezeAuthority !== undefined,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function FindingSection({ title, flags }: { title: string; flags: RiskFlag[] }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600">{title}</p>
      {flags.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-black/25 px-3 py-2 text-xs text-zinc-500">No findings in this category.</div>
      ) : (
        <FlagList flags={flags} />
      )}
    </div>
  );
}

function TrustIndicator({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 transition-colors hover:border-emerald-500/25">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", ok === undefined ? "bg-zinc-500" : ok ? "bg-emerald-400" : "bg-amber-400")} />
        <p className="truncate text-xs text-zinc-300">{value}</p>
      </div>
    </div>
  );
}

function PreTradeResult({
  tokenScan,
  onSimulate,
  isSimulating,
}: {
  tokenScan: NonNullable<ReturnType<typeof useWalletRiskScan>["tokenScan"]>;
  onSimulate: () => void;
  isSimulating: boolean;
}) {
  const asset = tokenScan.asset;
  const verdict = tokenScan.verdict || asset.verdict || getVerdict(tokenScan.riskScore);
  const confidence = tokenScan.confidence || asset.confidence || confidenceForAsset(asset);
  const realFindings = asset.riskFlags.filter((item) => item.status !== "unknown");
  const critical = realFindings.filter((item) => item.severity === "HIGH" || item.severity === "CRITICAL");
  const medium = realFindings.filter((item) => item.severity === "MEDIUM");
  const info = asset.riskFlags.filter((item) => item.status === "unknown" || item.severity === "SAFE");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <div className={cn("rounded-xl border p-4 shadow-lg", verdictStyles[verdict])}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">Final Verdict</p>
            <p className="mt-1 text-2xl font-bold">{verdict}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] opacity-70">Confidence</p>
            <p className="text-lg font-semibold">{confidence}%</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed opacity-90">
          {asset.aiExplanation || "SolGuard built a deterministic AI risk profile from available on-chain evidence."}
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/30">
          <motion.div
            className="h-full rounded-full bg-current"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(8, 100 - tokenScan.riskScore)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <TrustIndicator label="Metadata" value={asset.metadataStatus} ok={asset.metadataStatus === "verified"} />
        <TrustIndicator label="Liquidity" value={asset.evidence.liquidityUSD == null ? "Unavailable" : `$${asset.evidence.liquidityUSD.toLocaleString()}`} ok={asset.evidence.liquidityUSD != null && asset.evidence.liquidityUSD > 50_000} />
        <TrustIndicator label="Mint authority" value={asset.evidence.mintAuthority ? "Active" : "None"} ok={!asset.evidence.mintAuthority} />
        <TrustIndicator label="Freeze authority" value={asset.evidence.freezeAuthority ? "Active" : "None"} ok={!asset.evidence.freezeAuthority} />
        <TrustIndicator label="Holder concentration" value={asset.evidence.topHolderPercent == null ? "Unavailable" : `${asset.evidence.topHolderPercent}% top holder`} ok={asset.evidence.topHolderPercent != null && asset.evidence.topHolderPercent < 25} />
        <TrustIndicator label="Token age" value="Unavailable" />
      </div>

      <FindingSection title="Critical Risks" flags={critical} />
      <FindingSection title="Medium Risks" flags={medium} />
      <FindingSection title="Informational Notes" flags={info} />

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600">Evidence</p>
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3 text-xs text-zinc-500">
          <p><span className="text-zinc-300">Mint:</span> {tokenScan.mintAddress}</p>
          <p><span className="text-zinc-300">Owner program:</span> {asset.evidence.ownerProgram || "Unknown"}</p>
          <p><span className="text-zinc-300">Top 5 holders:</span> {asset.evidence.topFivePercent == null ? "Unavailable" : `${asset.evidence.topFivePercent}%`}</p>
        </div>
      </div>

      <Button disabled={isSimulating} onClick={onSimulate} className="w-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20">
        {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isSimulating ? "Simulating transaction" : "Preview before signing"}
      </Button>
    </motion.div>
  );
}

function AssetTable({ assets }: { assets: ScannedAsset[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="grid grid-cols-[1.3fr_1fr_0.7fr_0.7fr] gap-3 border-b border-zinc-800 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
        <span>Asset</span>
        <span>Mint</span>
        <span>Balance</span>
        <span>Risk</span>
      </div>
      <div className="divide-y divide-zinc-900">
        {assets.length === 0 && (
          <div className="px-4 py-6 text-sm text-zinc-500">No token accounts found.</div>
        )}
        {assets.map((asset) => (
          <details key={`${asset.mintAddress}-${asset.tokenAccountAddress || "mint"}`} className="group">
            <summary className="grid cursor-pointer grid-cols-[1.3fr_1fr_0.7fr_0.7fr] gap-3 px-4 py-3 text-sm hover:bg-zinc-900/60">
              <span>
                <span className="block font-medium text-zinc-100">{asset.symbol}</span>
                <span className="block truncate text-xs text-zinc-500">{asset.name}</span>
                {asset.isZeroBalance && (
                  <span className="mt-1 inline-block rounded border border-amber-500/30 px-1.5 py-0.5 text-[10px] text-amber-300">
                    zero balance
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-zinc-400">{formatAddress(asset.mintAddress)}</span>
              <span className="text-zinc-300">{asset.balance}</span>
              <span><RiskBadge level={asset.riskLevel} /></span>
            </summary>
            <div className="grid gap-4 border-t border-zinc-900 bg-black/30 px-4 py-4 md:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-300">AI-style deterministic explanation</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{asset.aiExplanation}</p>
                </div>
                <FlagList flags={asset.riskFlags} />
              </div>
              <div className="space-y-2 text-xs text-zinc-500">
                <p><span className="text-zinc-300">Token account:</span> {asset.tokenAccountAddress || "N/A"}</p>
                <p><span className="text-zinc-300">Mint:</span> {asset.mintAddress}</p>
                <p><span className="text-zinc-300">Metadata:</span> {asset.metadataStatus}</p>
                <p><span className="text-zinc-300">Mint authority:</span> {asset.evidence.mintAuthority || "None"}</p>
                <p><span className="text-zinc-300">Freeze authority:</span> {asset.evidence.freezeAuthority || "None"}</p>
                <p><span className="text-zinc-300">Delegate:</span> {asset.evidence.delegate || "None"}</p>
                <p><span className="text-zinc-300">Liquidity:</span> {asset.evidence.liquidityUSD == null ? "Unknown" : `$${asset.evidence.liquidityUSD.toLocaleString()}`}</p>
                <p><span className="text-zinc-300">Top holder:</span> {asset.evidence.topHolderPercent == null ? "Unknown" : `${asset.evidence.topHolderPercent}%`}</p>
                <p><span className="text-zinc-300">Top 5 holders:</span> {asset.evidence.topFivePercent == null ? "Unknown" : `${asset.evidence.topFivePercent}%`}</p>
                <p><span className="text-zinc-300">Metadata URI:</span> {asset.evidence.metadataUri || "Unknown"}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mintAddress, setMintAddress] = useState("");
  const { connected } = useWallet();
  const {
    walletAddress,
    walletScan,
    tokenScan,
    monitorScan,
    simulation,
    scoreHistory,
    isScanningWallet,
    isScanningToken,
    isSimulating,
    monitoring,
    error,
    setMonitoring,
    runWalletScan,
    runTokenScan,
    runSimulation,
  } = useWalletRiskScan();

  const evidence = walletScan?.evidence;
  const assets = walletScan?.assets || [];
  const alerts = monitorScan?.alerts || walletScan?.alerts || [];
  const nftRisks = walletScan?.nftRisks || [];
  const scanActive = isScanningWallet || isScanningToken || isSimulating || monitoring;
  const scanMode = isScanningWallet
    ? "wallet scan"
    : isScanningToken
      ? "token scan"
      : isSimulating
        ? "simulation"
        : monitoring
          ? "monitoring"
          : "idle";
  const topWhaleAsset = [...assets]
    .filter((asset) => asset.whaleSummary)
    .sort((a, b) => (b.whaleSummary?.topHolderPercent || 0) - (a.whaleSummary?.topHolderPercent || 0))[0];
  const distributionText = useMemo(
    () => walletScan?.distribution.map((item) => `${item.label}: ${item.count}`).join(" / ") || "No scan yet",
    [walletScan]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={cn("fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:z-auto", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative">
          <button
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="pl-12 lg:pl-0">
            <Navbar title="SolGuard MVP Console" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
            <section className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Wallet Risk Scan</p>
                  <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                    {connected ? formatAddress(walletAddress) : "Connect Phantom to scan portfolio risk"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <WalletButton />
                  <Button disabled={!walletAddress || isScanningWallet} onClick={() => void runWalletScan()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isScanningWallet ? "Scanning" : "Rescan"}
                  </Button>
                  <Button
                    variant={monitoring ? "destructive" : "secondary"}
                    disabled={!walletAddress}
                    onClick={() => setMonitoring(!monitoring)}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    {monitoring ? "Stop monitoring" : "Enable monitoring"}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </section>

            <AiScanEngine active={scanActive} mode={scanMode} />

            <section className="grid gap-3 md:grid-cols-5">
              <StatCard label="Wallet Score" value={walletScan?.walletSafetyScore ?? "—"} />
              <StatCard label="Tokens Scanned" value={walletScan?.totals.tokensScanned ?? 0} />
              <StatCard label="Risky Assets" value={walletScan?.totals.riskyAssets ?? 0} />
              <StatCard label="Zero Balance" value={walletScan?.totals.zeroBalanceSuspiciousAssets ?? 0} />
              <StatCard label="Unverified" value={walletScan?.totals.unverifiedTokens ?? 0} />
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Real-Time Alerts</p>
                  <span className="rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-500">{alerts.length} active</span>
                </div>
                <AlertsPanel alerts={alerts.slice(0, 5)} />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-600">Score History</p>
                <ScoreTimeline history={scoreHistory} />
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Portfolio Risk Dashboard</p>
                      <p className="mt-2 text-sm text-zinc-400">{distributionText}</p>
                    </div>
                    {walletScan && <RiskBadge level={walletScan.riskLevel} />}
                  </div>
                  <AssetTable assets={assets} />
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-600">Debug / Evidence</p>
                  <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-2">
                    <p><span className="text-zinc-200">Wallet:</span> {evidence?.walletAddress || walletAddress || "Not connected"}</p>
                    <p><span className="text-zinc-200">RPC:</span> {evidence?.rpcSource || "No scan yet"}</p>
                    <p><span className="text-zinc-200">Token accounts found:</span> {evidence?.tokenAccountsFound ?? 0}</p>
                    <p><span className="text-zinc-200">Parsed token accounts:</span> {evidence?.parsedTokenAccounts ?? 0}</p>
                    <p><span className="text-zinc-200">Timestamp:</span> {evidence?.scannedAt || "No scan yet"}</p>
                    <p><span className="text-zinc-200">Distribution:</span> {distributionText}</p>
                  </div>
                  <div className="mt-4 space-y-1 text-xs text-zinc-500">
                    {(evidence?.notes || []).map((note) => <p key={note}>{note}</p>)}
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Pre-Trade Protection</p>
                      <p className="mt-1 text-xs text-zinc-500">Paste a mint and get a structured buy/no-buy security verdict.</p>
                    </div>
                    <Cpu className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      value={mintAddress}
                      onChange={(event) => setMintAddress(event.target.value)}
                      placeholder="Paste token mint address"
                      className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500"
                    />
                    <Button disabled={isScanningToken} onClick={() => void runTokenScan(mintAddress)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {isScanningToken && (
                    <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-3">
                      <div className="flex items-center gap-2 text-sm text-emerald-200">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Building pre-trade risk profile...
                      </div>
                    </div>
                  )}
                  {tokenScan && !isScanningToken && (
                    <PreTradeResult
                      tokenScan={tokenScan}
                      isSimulating={isSimulating}
                      onSimulate={() => void runSimulation(tokenScan.mintAddress)}
                    />
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Transaction Simulation</p>
                  {!simulation && <p className="mt-4 text-sm text-zinc-500">Run a token scan, then preview what a transaction could affect before signing.</p>}
                  {simulation && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{simulation.simulationMode} mode</span>
                        <RiskBadge level={simulation.riskLevel} />
                      </div>
                      {simulation.summary.map((item) => (
                        <p key={item} className="text-sm text-zinc-400">{item}</p>
                      ))}
                      <div className="rounded-lg border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-500">
                        <p>Transfers: {simulation.tokenTransfers.length}</p>
                        <p>Approvals: {simulation.approvals.length}</p>
                        <p>Suspicious programs: {simulation.suspiciousPrograms.length}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Live Monitoring</p>
                  <div className="mt-4 space-y-3">
                    {!monitoring && <p className="text-sm text-zinc-500">Monitoring is off.</p>}
                    {monitoring && !monitorScan && <p className="text-sm text-zinc-500">Waiting for first polling result.</p>}
                    {monitorScan?.alerts.slice(0, 4).map((alert) => (
                      <div key={alert.id} className="rounded-lg border border-zinc-800 bg-black/40 px-3 py-2">
                        <div className="flex items-center gap-2">
                          {alert.severity === "SAFE" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                          <RiskBadge level={alert.severity} />
                        </div>
                        <p className="mt-2 text-sm font-medium text-zinc-200">{alert.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">{alert.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Suspicious NFT Detection</p>
                  <div className="mt-4">
                    <NftRiskPanel nftRisks={nftRisks} />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Whale Tracking</p>
                  <div className="mt-4 space-y-3 text-sm text-zinc-400">
                    {!topWhaleAsset && <p>No holder concentration data yet.</p>}
                    {topWhaleAsset?.whaleSummary && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-zinc-100">{topWhaleAsset.symbol}</p>
                            <p className="text-xs text-zinc-500">{topWhaleAsset.whaleSummary.source} source</p>
                          </div>
                          <RiskBadge level={topWhaleAsset.whaleSummary.riskLevel} />
                        </div>
                        <p>Top holder: {topWhaleAsset.whaleSummary.topHolderPercent == null ? "Unknown" : `${topWhaleAsset.whaleSummary.topHolderPercent}%`}</p>
                        <p>Top 5 holders: {topWhaleAsset.whaleSummary.topFivePercent == null ? "Unknown" : `${topWhaleAsset.whaleSummary.topFivePercent}%`}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Summary</p>
                  <div className="mt-4 space-y-2">
                    {(walletScan?.summary || ["Connect wallet to start real scan"]).map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                        {walletScan?.riskLevel === "SAFE" ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <ShieldAlert className="h-4 w-4 text-amber-400" />}
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
