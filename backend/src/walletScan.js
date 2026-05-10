import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { config } from "./config.js";
import { alertsFromAssets } from "./alertEngine.js";
import { appendScoreHistory } from "./historyStore.js";
import { scanWalletNfts } from "./nftAnalysis.js";
import { analyzeMint } from "./tokenAnalysis.js";
import { clampScore, riskLevelFromScore, toPublicKey, uiAmount, withTimeout } from "./utils.js";

export async function getWalletTokenAccounts(walletAddress) {
  const owner = toPublicKey(walletAddress, "walletAddress");
  const programs = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID];
  const results = await Promise.allSettled(
    programs.map(async (programId) => {
      const response = await fetch(config.rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `solguard-token-accounts-${programId.toBase58()}`,
          method: "getTokenAccountsByOwner",
          params: [
            owner.toBase58(),
            { programId: programId.toBase58() },
            { encoding: "jsonParsed", commitment: "confirmed" },
          ],
        }),
      });
      if (!response.ok) throw new Error(`RPC returned ${response.status} for ${programId.toBase58()}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "RPC token account query failed");
      return data.result;
    })
  );
  return results.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    return result.value.value.map((entry) => {
      const info = entry.account.data.parsed.info;
      return {
        tokenAccountAddress: typeof entry.pubkey === "string" ? entry.pubkey : entry.pubkey.toBase58(),
        mintAddress: info.mint,
        tokenAmount: info.tokenAmount,
        isZeroBalance: info.tokenAmount.amount === "0",
        delegate: info.delegate || null,
        delegatedAmount: info.delegatedAmount?.amount || null,
      };
    });
  });
}

function walletSummary(assets) {
  const riskyAssets = assets.filter((asset) => ["HIGH", "CRITICAL"].includes(asset.riskLevel)).length;
  const zeroBalanceSuspiciousAssets = assets.filter(
    (asset) => asset.isZeroBalance && asset.riskFlags.some((riskFlag) => riskFlag.id === "zero-balance-asset")
  ).length;
  const unverifiedTokens = assets.filter((asset) => asset.metadataStatus !== "verified").length;
  const activeMintAuthority = assets.filter((asset) => asset.riskFlags.some((riskFlag) => riskFlag.id === "mint-authority-active")).length;
  const criticalAssets = assets.filter((asset) => asset.riskLevel === "CRITICAL").length;
  const weightedPenalty = assets.reduce((sum, asset) => {
    const balanceWeight = asset.isZeroBalance ? 0.45 : 1;
    const severityWeight = asset.riskLevel === "CRITICAL" ? 1.2 : asset.riskLevel === "HIGH" ? 1 : 0.6;
    return sum + Math.min(30, asset.riskScore / 3) * balanceWeight * severityWeight;
  }, criticalAssets * 5);
  const walletSafetyScore = clampScore(100 - weightedPenalty);
  return {
    walletSafetyScore,
    riskLevel: riskLevelFromScore(100 - walletSafetyScore),
    summary: [
      `${riskyAssets} suspicious tokens detected`,
      `${activeMintAuthority} token${activeMintAuthority === 1 ? " has" : "s have"} active mint authority`,
      `${zeroBalanceSuspiciousAssets} zero-balance possible spam/inactive assets found`,
    ],
    totals: {
      tokensScanned: assets.length,
      riskyAssets,
      zeroBalanceSuspiciousAssets,
      unverifiedTokens,
    },
    distribution: ["SAFE", "MEDIUM", "HIGH", "CRITICAL"].map((label) => ({
      label,
      count: assets.filter((asset) => asset.riskLevel === label).length,
    })),
  };
}

export async function scanWallet(walletAddress, options = {}) {
  toPublicKey(walletAddress, "walletAddress");
  const scannedAt = new Date().toISOString();
  const notes = [];
  let tokenAccounts = [];
  let nftRisks = [];
  try {
    tokenAccounts = await withTimeout(getWalletTokenAccounts(walletAddress), 18_000, "wallet token account discovery");
  } catch (error) {
    notes.push(`Wallet token account discovery unavailable: ${error.message}`);
  }
  try {
    nftRisks = await withTimeout(scanWalletNfts(walletAddress), 10_000, "NFT asset discovery");
  } catch (error) {
    notes.push(`NFT asset discovery unavailable: ${error.message}`);
  }
  const tokenAccountsForDeepScan = tokenAccounts.slice(0, options.limit || 60);
  const assets = [];
  for (const tokenAccount of tokenAccountsForDeepScan) {
    try {
      assets.push(await analyzeMint(tokenAccount.mintAddress, tokenAccount));
    } catch (error) {
      assets.push({
        mintAddress: tokenAccount.mintAddress,
        tokenAccountAddress: tokenAccount.tokenAccountAddress,
        name: "Unparsed Asset",
        symbol: "UNKNOWN",
        balance: uiAmount(tokenAccount.tokenAmount.amount, tokenAccount.tokenAmount.decimals),
        rawAmount: tokenAccount.tokenAmount.amount,
        decimals: tokenAccount.tokenAmount.decimals,
        isZeroBalance: tokenAccount.isZeroBalance,
        metadataStatus: "unknown",
        riskLevel: "MEDIUM",
        riskScore: 35,
        confidence: 20,
        verdict: "CAUTION",
        riskFlags: [{
          id: "parse-failed",
          label: "Asset parse failed",
          severity: "MEDIUM",
          explanation: error.message,
          status: "unknown",
        }],
        evidence: {},
        aiExplanation: `SolGuard found the token account but could not parse the mint cleanly: ${error.message}`,
      });
    }
  }
  const summary = walletSummary(assets);
  const baseScan = {
    walletAddress,
    ...summary,
    assets,
    nftRisks,
    alerts: alertsFromAssets(assets, nftRisks, walletAddress),
    scoreHistory: [],
    monitoring: {
      status: options.monitoring ? "active" : "inactive",
      intervalSeconds: options.intervalSeconds || 45,
      lastCheckedAt: scannedAt,
    },
    evidence: {
      walletAddress,
      rpcSource: config.rpcUrl,
      tokenAccountsFound: tokenAccounts.length,
      parsedTokenAccounts: assets.length,
      scannedAt,
      notes: [
        ...notes,
        "Positive-balance and visible zero-balance token accounts are included.",
        tokenAccounts.length > tokenAccountsForDeepScan.length
          ? `Deep risk analysis capped at ${tokenAccountsForDeepScan.length} visible token accounts for response time.`
          : "All visible token accounts were deeply analyzed.",
        nftRisks.length
          ? `${nftRisks.length} NFT assets inspected through Helius.`
          : "NFT scan uses Helius when HELIUS_API_KEY is configured; otherwise NFT-only wallet spam may be unavailable.",
        config.heliusApiKey ? "Helius metadata is enabled." : "Helius metadata unavailable; using public RPC and DEX fallback.",
        config.birdeyeApiKey ? "Birdeye security checks are enabled." : "Birdeye security checks marked unknown.",
      ],
    },
  };
  baseScan.scoreHistory = appendScoreHistory(walletAddress, baseScan);
  return baseScan;
}
