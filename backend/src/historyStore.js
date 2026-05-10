import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

const HISTORY_FILE = path.join(config.dataDir, "score-history.json");
const SNAPSHOT_FILE = path.join(config.dataDir, "wallet-snapshots.json");

function ensureDataDir() {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    ensureDataDir();
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDataDir();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

export function readScoreHistory() {
  return readJson(HISTORY_FILE, {});
}

export function appendScoreHistory(walletAddress, scan) {
  const history = readScoreHistory();
  const point = {
    walletAddress,
    walletSafetyScore: scan.walletSafetyScore,
    riskLevel: scan.riskLevel,
    scannedAt: scan.evidence.scannedAt,
    riskyAssets: scan.totals.riskyAssets,
    zeroBalanceSuspiciousAssets: scan.totals.zeroBalanceSuspiciousAssets,
  };
  history[walletAddress] = [...(history[walletAddress] || []), point].slice(-50);
  writeJson(HISTORY_FILE, history);
  return history[walletAddress];
}

export function readWalletSnapshots() {
  return readJson(SNAPSHOT_FILE, {});
}

export function saveWalletSnapshot(walletAddress, scan) {
  const snapshots = readWalletSnapshots();
  const compactAssets = scan.assets.map((asset) => ({
    mintAddress: asset.mintAddress,
    balance: asset.rawAmount,
    riskScore: asset.riskScore,
    riskLevel: asset.riskLevel,
    mintAuthority: asset.evidence.mintAuthority || null,
    freezeAuthority: asset.evidence.freezeAuthority || null,
    liquidityUSD: asset.evidence.liquidityUSD ?? null,
    topHolderPercent: asset.evidence.topHolderPercent ?? null,
  }));
  snapshots[walletAddress] = {
    walletAddress,
    walletSafetyScore: scan.walletSafetyScore,
    riskLevel: scan.riskLevel,
    scannedAt: scan.evidence.scannedAt,
    assets: compactAssets,
    nftMints: scan.nftRisks.map((nft) => nft.mintAddress),
  };
  writeJson(SNAPSHOT_FILE, snapshots);
  return snapshots[walletAddress];
}
