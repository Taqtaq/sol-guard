import { AnalysisReport } from "@/types";

export const HIGH_RISK_REPORT: AnalysisReport = {
  tokenAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv",
  riskScore: 82,
  riskLevel: "HIGH",
  status: "HIGH RISK",
  aiSummary:
    "This token exhibits multiple high-risk characteristics consistent with known rug-pull patterns. Ownership is heavily centralized with top 3 wallets controlling 78% of supply. The mint authority remains active and unconstrained, allowing unlimited token minting at any time. Liquidity is extremely thin and concentrated in a single pool created 6 days ago. Transaction patterns show coordinated wash trading activity to simulate volume. Immediate caution is strongly advised.",
  tokenMetadata: {
    name: "SolFlare Finance",
    symbol: "SFLR",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv",
    decimals: 9,
    supply: "1,000,000,000",
    mintAuthority: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    freezeAuthority: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    updateAuthority: null,
    createdAt: "2024-01-15T08:23:11Z",
    network: "mainnet",
  },
  holderDistribution: [
    { name: "Dev Wallet", value: 420000000, percentage: 42 },
    { name: "Wallet #2", value: 180000000, percentage: 18 },
    { name: "Wallet #3", value: 110000000, percentage: 11 },
    { name: "Liquidity Pool", value: 90000000, percentage: 9 },
    { name: "Others", value: 200000000, percentage: 20 },
  ],
  transactionActivity: [
    { date: "Jan 10", transactions: 12, volume: 2300 },
    { date: "Jan 11", transactions: 28, volume: 5100 },
    { date: "Jan 12", transactions: 87, volume: 14200 },
    { date: "Jan 13", transactions: 143, volume: 28900 },
    { date: "Jan 14", transactions: 201, volume: 42100 },
    { date: "Jan 15", transactions: 167, volume: 31800 },
    { date: "Jan 16", transactions: 94, volume: 17600 },
    { date: "Jan 17", transactions: 312, volume: 58000 },
    { date: "Jan 18", transactions: 89, volume: 16200 },
    { date: "Jan 19", transactions: 44, volume: 8100 },
  ],
  riskBreakdown: [
    { category: "Centralization", score: 92, max: 100, label: "Critical" },
    { category: "Mint Authority", score: 85, max: 100, label: "High" },
    { category: "Liquidity Risk", score: 78, max: 100, label: "High" },
    { category: "Wash Trading", score: 71, max: 100, label: "High" },
    { category: "Freeze Authority", score: 80, max: 100, label: "High" },
    { category: "Age Risk", score: 65, max: 100, label: "Medium" },
  ],
  suspiciousSignals: [
    {
      id: "1",
      type: "danger",
      title: "Active Mint Authority",
      description:
        "Token mint authority is not renounced. Developer can mint unlimited tokens at any time, causing severe dilution.",
      severity: "CRITICAL",
    },
    {
      id: "2",
      type: "danger",
      title: "Freeze Authority Enabled",
      description:
        "Developer can freeze any token account, preventing holders from selling their tokens.",
      severity: "CRITICAL",
    },
    {
      id: "3",
      type: "danger",
      title: "Extreme Holder Concentration",
      description:
        "Top 3 wallets hold 71% of total supply. A coordinated dump would collapse the price.",
      severity: "HIGH",
    },
    {
      id: "4",
      type: "warning",
      title: "Wash Trading Detected",
      description:
        "Transaction patterns between 6 wallets show coordinated circular trading to simulate artificial volume.",
      severity: "HIGH",
    },
    {
      id: "5",
      type: "warning",
      title: "Low Liquidity Pool",
      description:
        "Total liquidity is $12,400 USD. Even a small sell order can cause significant price impact.",
      severity: "MEDIUM",
    },
    {
      id: "6",
      type: "warning",
      title: "New Token (6 days old)",
      description:
        "Token was created 6 days ago with no established track record or community presence.",
      severity: "MEDIUM",
    },
  ],
  walletActivity: [
    {
      address: "9WzDXwBb...9zYtAWWM",
      label: "Dev Wallet",
      percentage: 42,
      transactions: 34,
      firstSeen: "2024-01-15",
      lastSeen: "2024-01-19",
      isSuspicious: true,
    },
    {
      address: "3FZbgi29...8kQm2P1n",
      label: "Insider Wallet",
      percentage: 18,
      transactions: 12,
      firstSeen: "2024-01-15",
      lastSeen: "2024-01-18",
      isSuspicious: true,
    },
    {
      address: "DRpbCBMx...Ux6CsGBz",
      label: "Market Maker",
      percentage: 11,
      transactions: 89,
      firstSeen: "2024-01-15",
      lastSeen: "2024-01-19",
      isSuspicious: true,
    },
    {
      address: "6Ln8EA99...n5frMRQ4",
      label: "LP Wallet",
      percentage: 9,
      transactions: 8,
      firstSeen: "2024-01-15",
      lastSeen: "2024-01-19",
      isSuspicious: false,
    },
  ],
  liquidityUSD: 12400,
  marketCapUSD: 84200,
  analyzedAt: new Date().toISOString(),
};

export const LOW_RISK_REPORT: AnalysisReport = {
  tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  riskScore: 12,
  riskLevel: "LOW",
  status: "SAFE",
  aiSummary:
    "This token demonstrates strong security characteristics with no significant risk signals detected. Mint and freeze authorities are renounced, ensuring supply is fixed. Holder distribution is healthy with no single entity controlling more than 8% of supply. Liquidity is deep and distributed across multiple pools. Transaction patterns appear organic with consistent community-driven trading activity.",
  tokenMetadata: {
    name: "USD Coin",
    symbol: "USDC",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    supply: "43,218,000,000",
    mintAuthority: null,
    freezeAuthority: null,
    updateAuthority: null,
    createdAt: "2021-03-25T12:00:00Z",
    network: "mainnet",
  },
  holderDistribution: [
    { name: "Institution A", value: 8, percentage: 8 },
    { name: "Institution B", value: 6, percentage: 6 },
    { name: "DEX Pools", value: 35, percentage: 35 },
    { name: "Retail Holders", value: 38, percentage: 38 },
    { name: "Others", value: 13, percentage: 13 },
  ],
  transactionActivity: [
    { date: "Jan 10", transactions: 12400, volume: 2800000 },
    { date: "Jan 11", transactions: 13200, volume: 3100000 },
    { date: "Jan 12", transactions: 11800, volume: 2600000 },
    { date: "Jan 13", transactions: 14500, volume: 3400000 },
    { date: "Jan 14", transactions: 15200, volume: 3700000 },
    { date: "Jan 15", transactions: 13900, volume: 3200000 },
    { date: "Jan 16", transactions: 12600, volume: 2900000 },
    { date: "Jan 17", transactions: 16100, volume: 4000000 },
    { date: "Jan 18", transactions: 14800, volume: 3600000 },
    { date: "Jan 19", transactions: 13400, volume: 3100000 },
  ],
  riskBreakdown: [
    { category: "Centralization", score: 15, max: 100, label: "Low" },
    { category: "Mint Authority", score: 0, max: 100, label: "Safe" },
    { category: "Liquidity Risk", score: 8, max: 100, label: "Low" },
    { category: "Wash Trading", score: 12, max: 100, label: "Low" },
    { category: "Freeze Authority", score: 0, max: 100, label: "Safe" },
    { category: "Age Risk", score: 5, max: 100, label: "Low" },
  ],
  suspiciousSignals: [
    {
      id: "1",
      type: "info",
      title: "Verified Stablecoin",
      description:
        "Token is issued by Circle, a regulated financial institution with regular audits.",
      severity: "LOW",
    },
  ],
  walletActivity: [
    {
      address: "CiYwm...Bx9mP",
      label: "Circle Reserve",
      percentage: 8,
      transactions: 1240,
      firstSeen: "2021-03-25",
      lastSeen: "2024-01-19",
      isSuspicious: false,
    },
  ],
  liquidityUSD: 2800000000,
  marketCapUSD: 43218000000,
  analyzedAt: new Date().toISOString(),
};

export const DEMO_ADDRESSES: Record<string, AnalysisReport> = {
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv": HIGH_RISK_REPORT,
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: LOW_RISK_REPORT,
};

export function getMockReport(address: string): AnalysisReport {
  if (DEMO_ADDRESSES[address]) {
    return { ...DEMO_ADDRESSES[address], analyzedAt: new Date().toISOString() };
  }
  // Random score for unknown addresses
  const score = Math.floor(Math.random() * 100);
  const isHigh = score > 50;
  const base = isHigh ? HIGH_RISK_REPORT : LOW_RISK_REPORT;
  return {
    ...base,
    tokenAddress: address,
    riskScore: score,
    riskLevel: score > 75 ? "HIGH" : score > 50 ? "MEDIUM" : score > 25 ? "LOW" : "LOW",
    status: score > 75 ? "HIGH RISK" : score > 50 ? "MEDIUM RISK" : "SAFE",
    analyzedAt: new Date().toISOString(),
  };
}
