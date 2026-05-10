export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface HolderData {
  name: string;
  value: number;
  percentage: number;
}

export interface TransactionPoint {
  date: string;
  transactions: number;
  volume: number;
}

export interface RiskBreakdown {
  category: string;
  score: number;
  max: number;
  label: string;
}

export interface SuspiciousSignal {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  supply: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  updateAuthority: string | null;
  createdAt: string;
  network: "mainnet" | "devnet";
}

export interface WalletActivity {
  address: string;
  label: string;
  percentage: number;
  transactions: number;
  firstSeen: string;
  lastSeen: string;
  isSuspicious: boolean;
}

export interface AnalysisReport {
  tokenAddress: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: string;
  aiSummary: string;
  tokenMetadata: TokenMetadata;
  holderDistribution: HolderData[];
  transactionActivity: TransactionPoint[];
  riskBreakdown: RiskBreakdown[];
  suspiciousSignals: SuspiciousSignal[];
  walletActivity: WalletActivity[];
  liquidityUSD: number;
  marketCapUSD: number;
  analyzedAt: string;
}

export type AnalysisStep =
  | "idle"
  | "fetching"
  | "analyzing"
  | "generating"
  | "complete";
