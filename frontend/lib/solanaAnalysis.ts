import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import type {
  AnalysisReport,
  HolderData,
  TransactionPoint,
  RiskBreakdown,
  SuspiciousSignal,
  WalletActivity,
  RiskLevel,
} from "@/types";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY ?? "";
const HELIUS_RPC = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : (process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com");
const HELIUS_REST = `https://api.helius.xyz/v0`;

function getConnection() {
  return new Connection(HELIUS_RPC, { commitment: "confirmed" });
}

// ─── External API types ──────────────────────────────────────────────────────

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

interface DexPair {
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  volume: { h24: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  priceChange?: { h24?: number };
  txns?: { h24: { buys: number; sells: number } };
}

// ─── Data fetchers ───────────────────────────────────────────────────────────

async function fetchJupiterToken(address: string): Promise<JupiterToken | null> {
  try {
    const res = await fetch(`https://tokens.jup.ag/token/${address}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchDexScreener(address: string): Promise<DexPair | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.pairs?.length) return null;
    // Pick the pair with highest liquidity
    return (data.pairs as DexPair[]).sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    )[0];
  } catch {
    return null;
  }
}

// ─── Helius-specific fetchers ─────────────────────────────────────────────────

interface HeliusTokenAccount {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
}

interface HeliusTokenHolder {
  address: string;
  owner: string;
  amount: number;
}

/** Uses Helius getTokenAccounts (enhanced RPC) to get top holders */
async function fetchHeliusTopHolders(
  mint: string
): Promise<HeliusTokenHolder[]> {
  if (!HELIUS_API_KEY) return [];
  try {
    const res = await fetch(HELIUS_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "solguard-holders",
        method: "getTokenAccounts",
        params: { mint, limit: 20, displayOptions: {} },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const accounts: HeliusTokenAccount[] = json?.result?.token_accounts ?? [];
    return accounts
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((a) => ({ address: a.address, owner: a.owner, amount: a.amount }));
  } catch {
    return [];
  }
}

interface HeliusTokenMetadata {
  mint: string;
  onChainMetadata?: {
    metadata?: {
      data?: { name?: string; symbol?: string; uri?: string };
    };
  };
  legacyMetadata?: { name?: string; symbol?: string; logoURI?: string };
}

/** Uses Helius REST API to get rich token metadata */
async function fetchHeliusMetadata(
  mint: string
): Promise<HeliusTokenMetadata | null> {
  if (!HELIUS_API_KEY) return null;
  try {
    const res = await fetch(
      `${HELIUS_REST}/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mintAccounts: [mint] }),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json) ? json[0] ?? null : null;
  } catch {
    return null;
  }
}

/** Uses Helius enhanced transactions API */
async function fetchHeliusTransactions(
  address: string
): Promise<Array<{ timestamp: number; type: string; fee: number }>> {
  if (!HELIUS_API_KEY) return [];
  try {
    const res = await fetch(
      `${HELIUS_REST}/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=100`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

function formatSupply(total: number): string {
  if (total >= 1_000_000_000_000) return `${(total / 1_000_000_000_000).toFixed(2)}T`;
  if (total >= 1_000_000_000) return `${(total / 1_000_000_000).toFixed(2)}B`;
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(2)}M`;
  return total.toLocaleString();
}

function groupSigsByDay(
  sigs: Array<{ blockTime?: number | null }>
): TransactionPoint[] {
  const nowSec = Date.now() / 1000;
  const map: Record<string, number> = {};

  for (let i = 9; i >= 0; i--) {
    const key = new Date((nowSec - i * 86400) * 1000).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
    map[key] = 0;
  }

  for (const s of sigs) {
    if (!s.blockTime) continue;
    const key = new Date(s.blockTime * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in map) map[key]++;
  }

  return Object.entries(map).map(([date, transactions]) => ({
    date,
    transactions,
    volume: transactions * 120,
  }));
}

function groupHeliusTxsByDay(
  txns: Array<{ timestamp: number; fee?: number }>
): TransactionPoint[] {
  const nowSec = Date.now() / 1000;
  const map: Record<string, { count: number; fees: number }> = {};

  for (let i = 9; i >= 0; i--) {
    const key = new Date((nowSec - i * 86400) * 1000).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
    map[key] = { count: 0, fees: 0 };
  }

  for (const tx of txns) {
    const key = new Date(tx.timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in map) {
      map[key].count++;
      map[key].fees += tx.fee ?? 0;
    }
  }

  return Object.entries(map).map(([date, { count, fees }]) => ({
    date,
    transactions: count,
    volume: Math.round(fees / 1e6), // lamports → SOL approx
  }));
}

// ─── Risk engine ─────────────────────────────────────────────────────────────

interface RiskSignals {
  hasMintAuth: boolean;
  hasFreezeAuth: boolean;
  liquidityUSD: number;
  topHolderPct: number;
  top3HolderPct: number;
  ageInDays: number | null;
  notInJupiter: boolean;
  priceChange24h: number | null;
  name: string;
  symbol: string;
}

function computeRisk(s: RiskSignals): {
  score: number;
  breakdown: RiskBreakdown[];
  signals: SuspiciousSignal[];
} {
  let score = 0;
  const signals: SuspiciousSignal[] = [];

  if (s.hasMintAuth) {
    score += 30;
    signals.push({
      id: "mint-auth",
      type: "danger",
      title: "Active Mint Authority",
      description:
        "Mint authority is not renounced. The deployer can print unlimited tokens at any time — a critical rug-pull vector.",
      severity: "CRITICAL",
    });
  }

  if (s.hasFreezeAuth) {
    score += 25;
    signals.push({
      id: "freeze-auth",
      type: "danger",
      title: "Freeze Authority Enabled",
      description:
        "An active freeze authority can lock any holder's token account, preventing selling.",
      severity: "CRITICAL",
    });
  }

  if (s.topHolderPct > 30) {
    score += 15;
    signals.push({
      id: "top-holder",
      type: "danger",
      title: `Top Holder Controls ${s.topHolderPct.toFixed(1)}% of Supply`,
      description:
        "A single wallet holds a dominant share. One sell-off could collapse the price.",
      severity: "HIGH",
    });
  }

  if (s.top3HolderPct > 50) {
    score += 12;
    signals.push({
      id: "concentration",
      type: "warning",
      title: `Top 3 Wallets: ${s.top3HolderPct.toFixed(1)}% of Supply`,
      description:
        "High concentration among a small group of wallets. Coordinated dumping is a serious risk.",
      severity: "HIGH",
    });
  }

  if (s.liquidityUSD === 0) {
    score += 18;
    signals.push({
      id: "no-liq",
      type: "danger",
      title: "No Liquidity Pool Detected",
      description:
        "No active DEX pool found. Token may be untradeable or not yet launched.",
      severity: "HIGH",
    });
  } else if (s.liquidityUSD < 10_000) {
    score += 18;
    signals.push({
      id: "low-liq",
      type: "danger",
      title: `Critically Low Liquidity ($${s.liquidityUSD.toLocaleString()})`,
      description:
        "Liquidity is far below safe thresholds. Even a small sell order will cause massive price impact.",
      severity: "HIGH",
    });
  } else if (s.liquidityUSD < 100_000) {
    score += 8;
    signals.push({
      id: "thin-liq",
      type: "warning",
      title: `Low Liquidity ($${(s.liquidityUSD / 1000).toFixed(1)}K)`,
      description:
        "Liquidity is below recommended levels for safe trading.",
      severity: "MEDIUM",
    });
  }

  if (s.ageInDays !== null && s.ageInDays < 7) {
    score += 18;
    signals.push({
      id: "very-new",
      type: "warning",
      title: `Token is Only ${s.ageInDays} Day(s) Old`,
      description:
        "Extremely new tokens carry high exit scam risk with no established history.",
      severity: "HIGH",
    });
  } else if (s.ageInDays !== null && s.ageInDays < 30) {
    score += 8;
    signals.push({
      id: "new",
      type: "warning",
      title: `New Token (${s.ageInDays} Days Old)`,
      description:
        "Token has less than 30 days of on-chain history.",
      severity: "MEDIUM",
    });
  }

  if (s.notInJupiter) {
    score += 8;
    signals.push({
      id: "unverified",
      type: "warning",
      title: "Not in Jupiter Verified Token List",
      description:
        "Token is not listed on Jupiter's verified registry, indicating limited community vetting.",
      severity: "MEDIUM",
    });
  }

  if (s.priceChange24h !== null && s.priceChange24h < -50) {
    score += 10;
    signals.push({
      id: "price-crash",
      type: "danger",
      title: `Price Down ${Math.abs(s.priceChange24h).toFixed(1)}% in 24h`,
      description:
        "Severe price crash may indicate an ongoing dump or coordinated exit.",
      severity: "HIGH",
    });
  }

  score = Math.min(100, Math.round(score));

  const breakdown: RiskBreakdown[] = [
    {
      category: "Mint Authority",
      score: s.hasMintAuth ? 90 : 5,
      max: 100,
      label: s.hasMintAuth ? "Critical" : "Safe",
    },
    {
      category: "Freeze Authority",
      score: s.hasFreezeAuth ? 80 : 5,
      max: 100,
      label: s.hasFreezeAuth ? "High" : "Safe",
    },
    {
      category: "Supply Concentration",
      score: Math.min(100, Math.round(s.top3HolderPct)),
      max: 100,
      label:
        s.top3HolderPct > 70
          ? "Critical"
          : s.top3HolderPct > 50
          ? "High"
          : s.top3HolderPct > 30
          ? "Medium"
          : "Low",
    },
    {
      category: "Liquidity Risk",
      score:
        s.liquidityUSD === 0
          ? 80
          : s.liquidityUSD < 10_000
          ? 70
          : s.liquidityUSD < 100_000
          ? 40
          : 10,
      max: 100,
      label:
        s.liquidityUSD === 0
          ? "Critical"
          : s.liquidityUSD < 10_000
          ? "High"
          : s.liquidityUSD < 100_000
          ? "Medium"
          : "Low",
    },
    {
      category: "Token Age",
      score:
        s.ageInDays === null
          ? 50
          : s.ageInDays < 7
          ? 80
          : s.ageInDays < 30
          ? 50
          : s.ageInDays < 90
          ? 20
          : 5,
      max: 100,
      label:
        s.ageInDays === null
          ? "Unknown"
          : s.ageInDays < 7
          ? "High"
          : s.ageInDays < 30
          ? "Medium"
          : "Low",
    },
    {
      category: "Verification",
      score: s.notInJupiter ? 40 : 5,
      max: 100,
      label: s.notInJupiter ? "Unverified" : "Verified",
    },
  ];

  return { score, breakdown, signals };
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

function getStatus(score: number): string {
  if (score >= 75) return "HIGH RISK";
  if (score >= 50) return "MEDIUM RISK";
  if (score >= 25) return "LOW RISK";
  return "SAFE";
}

function buildAISummary(s: RiskSignals, score: number): string {
  const level = getRiskLevel(score);
  const concerns: string[] = [];

  if (s.hasMintAuth) concerns.push("an active unconstrained mint authority");
  if (s.hasFreezeAuth) concerns.push("freeze authority over all token accounts");
  if (s.topHolderPct > 30)
    concerns.push(`a single wallet controlling ${s.topHolderPct.toFixed(1)}% of supply`);
  if (s.liquidityUSD < 10_000 && s.liquidityUSD >= 0)
    concerns.push("critically thin liquidity");
  if (s.ageInDays !== null && s.ageInDays < 30)
    concerns.push(`being only ${s.ageInDays} days old`);
  if (s.notInJupiter) concerns.push("absence from Jupiter's verified list");

  if (concerns.length === 0) {
    return `${s.name} (${s.symbol}) shows strong security characteristics. No critical risk signals were detected. Mint and freeze authorities appear renounced, supply distribution looks healthy, and liquidity is adequate. Always conduct your own research.`;
  }

  const concatConcerns = concerns.slice(0, 3).join(", ");
  return `${s.name} (${s.symbol}) exhibits ${level === "HIGH" ? "multiple high-risk" : "moderate"} characteristics, including ${concatConcerns}. ${level === "HIGH" ? "Extreme caution is strongly advised before interacting with this token." : "Conduct thorough due diligence before investing."}`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function analyzeToken(addressString: string): Promise<AnalysisReport> {
  if (addressString.startsWith("0x")) {
    throw new Error(
      "This looks like an Ethereum address. SolGuard AI only supports Solana (Base58) addresses."
    );
  }

  let mintPubkey: PublicKey;
  try {
    mintPubkey = new PublicKey(addressString);
  } catch {
    throw new Error(
      "Invalid Solana address. Please enter a valid Base58-encoded token mint or wallet address."
    );
  }

  const connection = getConnection();

  // ── Step 1: Inspect account type before calling getMint ──────────────────
  const accountInfo = await connection.getAccountInfo(mintPubkey);

  if (!accountInfo) {
    throw new Error(
      "Account not found on Solana mainnet. Double-check the address — it may be on devnet or doesn't exist yet."
    );
  }

  const TOKEN_PROGRAM_ID_STR = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
  const TOKEN_2022_ID_STR    = TOKEN_2022_PROGRAM_ID.toBase58();
  const SYSTEM_PROGRAM_STR   = "11111111111111111111111111111111";

  const ownerProgram = accountInfo.owner.toBase58();

  if (accountInfo.executable) {
    throw new Error(
      "This address is a Solana program/smart contract, not a token mint. Paste the token's mint address instead (find it on Solscan under the token page, not the program page)."
    );
  }

  if (ownerProgram === SYSTEM_PROGRAM_STR) {
    throw new Error(
      "This is a wallet address, not a token mint. To scan a token, paste its mint address (the token contract address shown on Solscan or DexScreener)."
    );
  }

  const isToken2022 = ownerProgram === TOKEN_2022_ID_STR;
  const isTokenProgram = ownerProgram === TOKEN_PROGRAM_ID_STR;

  if (!isToken2022 && !isTokenProgram) {
    throw new Error(
      `This account is owned by an unknown program (${ownerProgram.slice(0, 12)}…). Only SPL Token and Token-2022 mint addresses are supported.`
    );
  }

  // ── Step 2: Fetch all data in parallel (Helius-enhanced) ─────────────────
  const [mintResult, sigsResult, jupResult, dexResult, heliusHolders, heliusMeta, heliusTxns] =
    await Promise.allSettled([
      isToken2022
        ? getMint(connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID)
        : getMint(connection, mintPubkey),
      connection.getSignaturesForAddress(mintPubkey, { limit: 100 }),
      fetchJupiterToken(addressString),
      fetchDexScreener(addressString),
      fetchHeliusTopHolders(addressString),
      fetchHeliusMetadata(addressString),
      fetchHeliusTransactions(addressString),
    ]);

  if (mintResult.status === "rejected") {
    throw new Error(
      `Failed to parse token mint data: ${mintResult.reason?.message ?? "unknown error"}`
    );
  }

  const mint = mintResult.value;
  const sigs = sigsResult.status === "fulfilled" ? sigsResult.value : [];
  const jupToken = jupResult.status === "fulfilled" ? jupResult.value : null;
  const dex = dexResult.status === "fulfilled" ? dexResult.value : null;
  const topHolders = heliusHolders.status === "fulfilled" ? heliusHolders.value : [];
  const heliusMetaData = heliusMeta.status === "fulfilled" ? heliusMeta.value : null;
  const heliusTxData = heliusTxns.status === "fulfilled" ? heliusTxns.value : [];

  // ── Token metadata (Helius > Jupiter > DexScreener fallback) ──
  const heliusName =
    heliusMetaData?.onChainMetadata?.metadata?.data?.name?.replace(/\0/g, "").trim() ||
    heliusMetaData?.legacyMetadata?.name;
  const heliusSymbol =
    heliusMetaData?.onChainMetadata?.metadata?.data?.symbol?.replace(/\0/g, "").trim() ||
    heliusMetaData?.legacyMetadata?.symbol;

  const name = heliusName ?? jupToken?.name ?? dex?.baseToken?.name ?? "Unknown Token";
  const symbol = heliusSymbol ?? jupToken?.symbol ?? dex?.baseToken?.symbol ?? "???";
  const decimals = mint.decimals;
  const totalSupply = Number(mint.supply) / Math.pow(10, decimals);
  const mintAuthority = mint.mintAuthority?.toBase58() ?? null;
  const freezeAuthority = mint.freezeAuthority?.toBase58() ?? null;

  // ── Holder distribution (Helius getTokenAccounts > RPC fallback) ──────────
  let holderData: HolderData[] = [];
  let topHolderPct = 0;
  let top3HolderPct = 0;

  if (topHolders.length > 0 && totalSupply > 0) {
    const sliced = topHolders.slice(0, 5);
    const topSum = sliced.reduce((s, h) => s + h.amount / Math.pow(10, decimals), 0);
    const otherAmt = Math.max(0, totalSupply - topSum);

    holderData = sliced.map((h, i) => {
      const uiAmount = h.amount / Math.pow(10, decimals);
      const pct = (uiAmount / totalSupply) * 100;
      return {
        name: i === 0 ? "Top Holder" : i === 1 ? "Holder #2" : i === 2 ? "Holder #3" : `Wallet #${i + 1}`,
        value: uiAmount,
        percentage: Math.round(pct * 10) / 10,
      };
    });

    if (otherAmt > 0) {
      holderData.push({
        name: "Others",
        value: otherAmt,
        percentage: Math.round((otherAmt / totalSupply) * 1000) / 10,
      });
    }

    topHolderPct = holderData[0]?.percentage ?? 0;
    top3HolderPct = holderData.slice(0, 3).reduce((s, h) => s + h.percentage, 0);
  }

  // ── Wallet activity (Helius owner addresses) ──────────────────────────────
  const walletActivity: WalletActivity[] = topHolders.slice(0, 4).map((h, i) => {
    const uiAmount = h.amount / Math.pow(10, decimals);
    const pct = totalSupply > 0 ? (uiAmount / totalSupply) * 100 : 0;
    const suspicious = pct > 20;
    return {
      address: shortAddr(h.owner),
      label: i === 0 && pct > 30 ? "Dev Wallet?" : i === 0 ? "Top Holder" : `Wallet #${i + 1}`,
      percentage: Math.round(pct * 10) / 10,
      transactions: 0,
      firstSeen: "On-chain",
      lastSeen: "On-chain",
      isSuspicious: suspicious,
    };
  });

  // ── Transaction history (Helius enhanced txns > RPC sigs fallback) ────────
  let transactionActivity: TransactionPoint[];
  if (heliusTxData.length > 0) {
    transactionActivity = groupHeliusTxsByDay(heliusTxData);
  } else {
    transactionActivity = groupSigsByDay(sigs);
  }

  // ── DEX data ──
  const liquidityUSD = dex?.liquidity?.usd ?? 0;
  const marketCapUSD = dex?.marketCap ?? dex?.fdv ?? 0;
  const priceChange24h = dex?.priceChange?.h24 ?? null;

  // ── Token age ──
  let ageInDays: number | null = null;
  if (dex?.pairCreatedAt) {
    ageInDays = Math.floor((Date.now() - dex.pairCreatedAt) / 86_400_000);
  } else if (sigs.length > 0) {
    const oldest = sigs[sigs.length - 1];
    if (oldest.blockTime) {
      ageInDays = Math.floor(
        (Date.now() / 1000 - oldest.blockTime) / 86400
      );
    }
  }

  const createdAt =
    ageInDays !== null
      ? new Date(Date.now() - ageInDays * 86_400_000).toISOString()
      : new Date().toISOString();

  // ── Risk scoring ──
  const riskSignals: RiskSignals = {
    hasMintAuth: !!mintAuthority,
    hasFreezeAuth: !!freezeAuthority,
    liquidityUSD,
    topHolderPct,
    top3HolderPct,
    ageInDays,
    notInJupiter: !jupToken,
    priceChange24h,
    name,
    symbol,
  };

  const { score, breakdown, signals } = computeRisk(riskSignals);

  return {
    tokenAddress: addressString,
    riskScore: score,
    riskLevel: getRiskLevel(score),
    status: getStatus(score),
    aiSummary: buildAISummary(riskSignals, score),
    tokenMetadata: {
      name,
      symbol,
      address: addressString,
      decimals,
      supply: formatSupply(totalSupply),
      mintAuthority,
      freezeAuthority,
      updateAuthority: null,
      createdAt,
      network: "mainnet",
    },
    holderDistribution:
      holderData.length > 0
        ? holderData
        : [{ name: "Data Unavailable", value: 100, percentage: 100 }],
    transactionActivity,
    riskBreakdown: breakdown,
    suspiciousSignals: signals,
    walletActivity,
    liquidityUSD,
    marketCapUSD,
    analyzedAt: new Date().toISOString(),
  };
}
