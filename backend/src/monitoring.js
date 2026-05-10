import { createAlert } from "./alertEngine.js";
import { readWalletSnapshots, saveWalletSnapshot } from "./historyStore.js";
import { scanWallet } from "./walletScan.js";

function assetMap(snapshotOrScan) {
  const assets = snapshotOrScan?.assets || [];
  return new Map(assets.map((asset) => [asset.mintAddress, asset]));
}

function compareSnapshots(previous, currentScan) {
  if (!previous) {
    return [{
      id: `monitor-baseline-${Date.now()}`,
      severity: "SAFE",
      title: "Monitoring baseline created",
      explanation: "SolGuard saved the current wallet state and will compare future scans against this baseline.",
      timestamp: currentScan.evidence.scannedAt,
      evidence: { tokensScanned: currentScan.assets.length },
      source: "monitoring",
      walletAddress: currentScan.walletAddress,
    }];
  }

  const alerts = [];
  const before = assetMap(previous);
  const after = assetMap(currentScan);
  for (const asset of currentScan.assets) {
    const old = before.get(asset.mintAddress);
    if (!old) {
      const severe = ["HIGH", "CRITICAL"].includes(asset.riskLevel);
      alerts.push({
        id: `monitor-new-token-${asset.mintAddress}-${Date.now()}`,
        severity: severe ? asset.riskLevel : "MEDIUM",
        title: severe ? "New risky token detected" : "New wallet asset detected",
        explanation: `${asset.symbol} appeared since the previous monitoring snapshot with ${asset.riskLevel} risk.`,
        timestamp: currentScan.evidence.scannedAt,
        evidence: { mintAddress: asset.mintAddress, balance: asset.balance, riskScore: asset.riskScore },
        source: "monitoring",
        walletAddress: currentScan.walletAddress,
        mintAddress: asset.mintAddress,
      });
      continue;
    }
    if (old.balance !== asset.rawAmount) {
      alerts.push({
        id: `monitor-balance-${asset.mintAddress}-${Date.now()}`,
        severity: asset.riskLevel === "CRITICAL" ? "HIGH" : "MEDIUM",
        title: "Token balance changed",
        explanation: `${asset.symbol} balance changed since the last scan.`,
        timestamp: currentScan.evidence.scannedAt,
        evidence: { before: old.balance, after: asset.rawAmount, mintAddress: asset.mintAddress },
        source: "monitoring",
        walletAddress: currentScan.walletAddress,
        mintAddress: asset.mintAddress,
      });
    }
    if (old.mintAuthority !== asset.evidence.mintAuthority || old.freezeAuthority !== asset.evidence.freezeAuthority) {
      alerts.push(createAlert({
        id: "authority-changed",
        label: "Authority state changed",
        severity: "HIGH",
        explanation: `${asset.symbol} mint/freeze authority state changed since the previous snapshot.`,
        status: "danger",
      }, {
        walletAddress: currentScan.walletAddress,
        mintAddress: asset.mintAddress,
        source: "monitoring",
        evidence: {
          oldMintAuthority: old.mintAuthority,
          newMintAuthority: asset.evidence.mintAuthority,
          oldFreezeAuthority: old.freezeAuthority,
          newFreezeAuthority: asset.evidence.freezeAuthority,
        },
      }));
    }
    const oldLiquidity = old.liquidityUSD;
    const newLiquidity = asset.evidence.liquidityUSD;
    if (typeof oldLiquidity === "number" && typeof newLiquidity === "number" && newLiquidity < oldLiquidity * 0.5) {
      alerts.push({
        id: `monitor-liquidity-${asset.mintAddress}-${Date.now()}`,
        severity: "HIGH",
        title: "Liquidity dropped sharply",
        explanation: `${asset.symbol} liquidity fell by more than 50% since the previous scan.`,
        timestamp: currentScan.evidence.scannedAt,
        evidence: { before: oldLiquidity, after: newLiquidity },
        source: "monitoring",
        walletAddress: currentScan.walletAddress,
        mintAddress: asset.mintAddress,
      });
    }
  }

  const previousNfts = new Set(previous.nftMints || []);
  for (const nft of currentScan.nftRisks) {
    if (!previousNfts.has(nft.mintAddress)) {
      alerts.push({
        id: `monitor-new-nft-${nft.mintAddress}-${Date.now()}`,
        severity: nft.riskLevel === "SAFE" ? "MEDIUM" : nft.riskLevel,
        title: "New NFT asset detected",
        explanation: `${nft.name} appeared since the previous monitoring snapshot.`,
        timestamp: currentScan.evidence.scannedAt,
        evidence: { mintAddress: nft.mintAddress, riskFlags: nft.riskFlags.length },
        source: "monitoring",
        walletAddress: currentScan.walletAddress,
        mintAddress: nft.mintAddress,
      });
    }
  }

  if (currentScan.walletSafetyScore < previous.walletSafetyScore - 10) {
    alerts.push({
      id: `monitor-score-drop-${Date.now()}`,
      severity: "HIGH",
      title: "Wallet score dropped",
      explanation: `Wallet safety score dropped from ${previous.walletSafetyScore} to ${currentScan.walletSafetyScore}.`,
      timestamp: currentScan.evidence.scannedAt,
      evidence: { before: previous.walletSafetyScore, after: currentScan.walletSafetyScore },
      source: "monitoring",
      walletAddress: currentScan.walletAddress,
    });
  }
  return alerts.slice(0, 30);
}

export async function monitorWallet(walletAddress) {
  const snapshots = readWalletSnapshots();
  const previous = snapshots[walletAddress];
  const scan = await scanWallet(walletAddress, { monitoring: true, intervalSeconds: 45 });
  const monitoringAlerts = compareSnapshots(previous, scan);
  saveWalletSnapshot(walletAddress, scan);
  return {
    ...scan,
    alerts: [...monitoringAlerts, ...scan.alerts].slice(0, 40),
    monitoring: {
      status: "active",
      intervalSeconds: 45,
      lastCheckedAt: scan.evidence.scannedAt,
      previousSnapshotAt: previous?.scannedAt || null,
      changesDetected: monitoringAlerts.filter((alert) => alert.severity !== "SAFE").length,
    },
  };
}
