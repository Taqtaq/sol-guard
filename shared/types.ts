export type RiskLevel = "SAFE" | "MEDIUM" | "HIGH" | "CRITICAL";
export type CheckStatus = "ok" | "warning" | "danger" | "unknown";

export interface RiskFlag {
  id: string;
  label: string;
  severity: RiskLevel;
  explanation: string;
  status: CheckStatus;
  evidence?: string;
}

export interface SecurityAlert {
  id: string;
  severity: RiskLevel;
  title: string;
  explanation: string;
  timestamp: string;
  evidence: Record<string, string | number | boolean | null | undefined>;
  source?: string;
  walletAddress?: string;
  mintAddress?: string;
}

export interface NftRisk {
  mintAddress: string;
  name: string;
  symbol: string;
  image?: string | null;
  metadataUri?: string | null;
  riskLevel: RiskLevel;
  riskFlags: RiskFlag[];
}

export interface WhaleHolder {
  address: string;
  percentage: number | null;
  amount: string;
  rank: number;
}

export interface WhaleSummary {
  topHolderPercent: number | null;
  topFivePercent: number | null;
  riskLevel: RiskLevel;
  holders: WhaleHolder[];
  source: "rpc" | "placeholder";
}

export interface Evidence {
  walletAddress?: string;
  mintAddress?: string;
  rpcSource: string;
  tokenAccountsFound: number;
  parsedTokenAccounts: number;
  scannedAt: string;
  notes: string[];
}

export interface ScannedAsset {
  mintAddress: string;
  tokenAccountAddress?: string;
  name: string;
  symbol: string;
  balance: string;
  rawAmount: string;
  decimals: number;
  isZeroBalance: boolean;
  metadataStatus: "verified" | "unverified" | "unknown";
  riskLevel: RiskLevel;
  riskScore: number;
  riskFlags: RiskFlag[];
  evidence: {
    ownerProgram?: string;
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    delegate?: string | null;
    delegatedAmount?: string | null;
    liquidityUSD?: number | null;
    marketCapUSD?: number | null;
    topHolderPercent?: number | null;
    topFivePercent?: number | null;
    metadataUri?: string | null;
    pairUrl?: string | null;
  };
  aiExplanation: string;
  whaleSummary?: WhaleSummary;
  isNftLike?: boolean;
  confidence?: number;
  verdict?: "SAFE" | "CAUTION" | "HIGH RISK" | "AVOID";
}

export interface WalletScanResponse {
  walletAddress: string;
  walletSafetyScore: number;
  riskLevel: RiskLevel;
  summary: string[];
  totals: {
    tokensScanned: number;
    riskyAssets: number;
    zeroBalanceSuspiciousAssets: number;
    unverifiedTokens: number;
  };
  distribution: Array<{ label: RiskLevel; count: number }>;
  assets: ScannedAsset[];
  nftRisks: NftRisk[];
  alerts: SecurityAlert[];
  scoreHistory: ScoreHistoryPoint[];
  monitoring?: {
    status: "active" | "inactive";
    intervalSeconds: number;
    lastCheckedAt: string;
    previousSnapshotAt?: string | null;
    changesDetected?: number;
  };
  evidence: Evidence;
  isMock?: boolean;
}

export interface TokenScanResponse {
  mintAddress: string;
  riskScore: number;
  riskLevel: RiskLevel;
  verdict?: "SAFE" | "CAUTION" | "HIGH RISK" | "AVOID";
  confidence?: number;
  summary: string[];
  asset: ScannedAsset;
  alerts: SecurityAlert[];
  whaleSummary: WhaleSummary;
  evidence: Evidence;
  isMock?: boolean;
}

export interface MonitorWalletResponse extends WalletScanResponse {
  alerts: SecurityAlert[];
}

export interface ScoreHistoryPoint {
  walletAddress: string;
  walletSafetyScore: number;
  riskLevel: RiskLevel;
  scannedAt: string;
  riskyAssets: number;
  zeroBalanceSuspiciousAssets: number;
}

export interface SimulationRequest {
  walletAddress?: string;
  transactionBase64?: string;
  mintAddress?: string;
  amount?: string;
}

export interface SimulationResponse {
  simulationMode: "mock" | "live";
  riskLevel: RiskLevel;
  summary: string[];
  tokenTransfers: Array<{ mintAddress: string; direction: "in" | "out" | "unknown"; amount: string }>;
  solChanges: Array<{ address: string; changeSol: number; explanation: string }>;
  approvals: Array<{ owner?: string; delegate?: string; riskLevel: RiskLevel; explanation: string }>;
  suspiciousPrograms: Array<{ programId: string; label: string; explanation: string }>;
  alerts: SecurityAlert[];
  evidence: Record<string, string | number | boolean | null | undefined>;
}
