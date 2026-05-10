import type {
  MonitorWalletResponse,
  DiagnosticsResponse,
  ScoreHistoryPoint,
  SimulationRequest,
  SimulationResponse,
  TokenScanResponse,
  WalletScanResponse,
} from "@shared/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Backend request failed: ${response.status}`);
  }
  return data as T;
}

export function scanWallet(walletAddress: string) {
  return postJson<WalletScanResponse>("/api/scan-wallet", { walletAddress });
}

export function scanToken(mintAddress: string) {
  return postJson<TokenScanResponse>("/api/scan-token", { mintAddress });
}

export function monitorWallet(walletAddress: string) {
  return postJson<MonitorWalletResponse>("/api/monitor-wallet", { walletAddress });
}

export function simulateTransaction(body: SimulationRequest) {
  return postJson<SimulationResponse>("/api/simulate-transaction", body);
}

export async function getScoreHistory(walletAddress: string) {
  const response = await fetch(`${BACKEND_URL}/api/score-history/${walletAddress}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `History request failed: ${response.status}`);
  }
  return data as { walletAddress: string; history: ScoreHistoryPoint[] };
}

export async function getDiagnostics() {
  const response = await fetch(`${BACKEND_URL}/api/diagnostics`);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Diagnostics request failed: ${response.status}`);
  }
  return data as DiagnosticsResponse;
}

export async function sendTelegramTestAlert() {
  return postJson<{ alert: unknown; telegram: { sent: boolean; reason?: string } }>("/api/telegram/test-alert", {
    evidence: { source: "dashboard-settings" },
  });
}
