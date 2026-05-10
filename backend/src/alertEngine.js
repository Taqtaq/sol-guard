import { config } from "./config.js";
import { nowIso } from "./utils.js";

const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, SAFE: 1 };

export function createAlert(flagItem, options = {}) {
  return {
    id: `${flagItem.id}-${options.mintAddress || options.walletAddress || "wallet"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    severity: flagItem.severity,
    title: flagItem.label,
    explanation: flagItem.explanation,
    timestamp: nowIso(),
    evidence: options.evidence || {},
    source: options.source || "scan-engine",
    walletAddress: options.walletAddress,
    mintAddress: options.mintAddress,
  };
}

export function alertsFromAssets(assets, nftRisks = [], walletAddress = undefined) {
  const tokenAlerts = assets.flatMap((asset) =>
    asset.riskFlags
      .filter((riskFlag) => ["HIGH", "CRITICAL"].includes(riskFlag.severity) || riskFlag.id === "zero-balance-asset")
      .map((riskFlag) =>
        createAlert(riskFlag, {
          walletAddress,
          mintAddress: asset.mintAddress,
          source: "token-analysis",
          evidence: {
            symbol: asset.symbol,
            riskScore: asset.riskScore,
            balance: asset.balance,
            evidence: riskFlag.evidence,
          },
        })
      )
  );
  const nftAlerts = nftRisks.flatMap((nft) =>
    nft.riskFlags
      .filter((riskFlag) => riskFlag.severity !== "SAFE")
      .map((riskFlag) =>
        createAlert(riskFlag, {
          walletAddress,
          mintAddress: nft.mintAddress,
          source: "nft-analysis",
          evidence: { name: nft.name, metadataUri: nft.metadataUri },
        })
      )
  );
  return [...tokenAlerts, ...nftAlerts]
    .sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])
    .slice(0, 30);
}

export async function sendTelegramAlert(alert) {
  if (!config.telegramBotToken || !config.telegramChatId) {
    return { sent: false, reason: "Telegram env vars are not configured." };
  }
  try {
    const text = [
      `SolGuard Alert: ${alert.title}`,
      `Severity: ${alert.severity}`,
      alert.explanation,
      alert.walletAddress ? `Wallet: ${alert.walletAddress}` : "",
      alert.mintAddress ? `Mint: ${alert.mintAddress}` : "",
    ].filter(Boolean).join("\n");
    const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ chat_id: config.telegramChatId, text }),
    });
    if (!response.ok) return { sent: false, reason: `Telegram API returned ${response.status}` };
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message || "Telegram request failed." };
  }
}

export async function sendTelegramForRiskAlerts(alerts, context = {}) {
  const actionable = alerts.filter((alert) => ["CRITICAL", "HIGH"].includes(alert.severity));
  if (!actionable.length) return { attempted: false, sent: 0, reason: "No high/critical alerts." };
  if (!config.telegramBotToken || !config.telegramChatId) {
    return { attempted: false, sent: 0, reason: "Telegram env vars are not configured." };
  }

  let sent = 0;
  const failures = [];
  for (const alert of actionable.slice(0, 3)) {
    const result = await sendTelegramAlert({
      ...alert,
      title: context.reason ? `${alert.title} (${context.reason})` : alert.title,
    });
    if (result.sent) sent += 1;
    else failures.push(result.reason);
  }
  return {
    attempted: true,
    sent,
    failed: failures.length,
    reason: failures[0],
  };
}
