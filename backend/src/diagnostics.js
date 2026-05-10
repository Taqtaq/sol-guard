import { config } from "./config.js";
import { nowIso } from "./utils.js";

function baseIntegration(name, configured, detail) {
  return {
    name,
    configured,
    status: configured ? "Configured" : "Missing",
    detail,
    checkedAt: nowIso(),
  };
}

async function testJsonRpc(url, body, label) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || `${label} JSON-RPC error`);
  return data;
}

async function checkSolanaRpc() {
  const item = baseIntegration("SOLANA_RPC_URL", Boolean(config.rpcUrl), "Mainnet RPC endpoint used for wallet and mint scans.");
  if (!item.configured) return item;
  try {
    await testJsonRpc(config.rpcUrl, {
      jsonrpc: "2.0",
      id: "solguard-diagnostics-rpc",
      method: "getHealth",
    }, "Solana RPC");
    return { ...item, status: "Working", detail: "RPC health check succeeded." };
  } catch (error) {
    return { ...item, status: "Failed", detail: error.message };
  }
}

async function checkHelius() {
  const item = baseIntegration("HELIUS_API_KEY", Boolean(config.heliusApiKey), "Enables richer asset metadata and NFT spam detection.");
  if (!item.configured) return item;
  try {
    await testJsonRpc(`https://mainnet.helius-rpc.com/?api-key=${config.heliusApiKey}`, {
      jsonrpc: "2.0",
      id: "solguard-diagnostics-helius",
      method: "getHealth",
    }, "Helius");
    return { ...item, status: "Working", detail: "Helius JSON-RPC health check succeeded." };
  } catch (error) {
    return { ...item, status: "Failed", detail: error.message };
  }
}

async function checkBirdeye() {
  const item = baseIntegration("BIRDEYE_API_KEY", Boolean(config.birdeyeApiKey), "Enables token security enrichment and known scam checks.");
  if (!item.configured) return item;
  try {
    const response = await fetch("https://public-api.birdeye.so/defi/token_security?address=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", {
      headers: { "X-API-KEY": config.birdeyeApiKey, "x-chain": "solana" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Birdeye returned HTTP ${response.status}`);
    return { ...item, status: "Working", detail: "Birdeye token security request succeeded." };
  } catch (error) {
    return { ...item, status: "Failed", detail: error.message };
  }
}

async function checkTelegramBot() {
  const item = baseIntegration("TELEGRAM_BOT_TOKEN", Boolean(config.telegramBotToken), "Required to send Telegram alerts.");
  if (!item.configured) return item;
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/getMe`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Telegram getMe returned HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok) throw new Error("Telegram bot token was rejected.");
    return { ...item, status: "Working", detail: "Telegram bot token is valid." };
  } catch (error) {
    return { ...item, status: "Failed", detail: error.message };
  }
}

function checkTelegramChat() {
  return {
    ...baseIntegration("TELEGRAM_CHAT_ID", Boolean(config.telegramChatId), "Required destination chat for alert delivery."),
    status: config.telegramChatId ? "Configured" : "Missing",
  };
}

function checkKnownScams() {
  return {
    ...baseIntegration("KNOWN_SCAM_MINTS", config.knownScamMints.size > 0, "Optional comma-separated local scam/rug mint list."),
    status: config.knownScamMints.size > 0 ? "Configured" : "Missing",
    detail: config.knownScamMints.size > 0
      ? `${config.knownScamMints.size} local threat-intel mint${config.knownScamMints.size === 1 ? "" : "s"} configured.`
      : "No local scam mint list configured.",
  };
}

export async function runDiagnostics() {
  const [solanaRpc, helius, birdeye, telegramBot] = await Promise.all([
    checkSolanaRpc(),
    checkHelius(),
    checkBirdeye(),
    checkTelegramBot(),
  ]);
  const integrations = [
    solanaRpc,
    helius,
    birdeye,
    telegramBot,
    checkTelegramChat(),
    checkKnownScams(),
  ];
  return {
    checkedAt: nowIso(),
    integrations,
    telegramReady: telegramBot.status === "Working" && Boolean(config.telegramChatId),
    alertPolicy: [
      "Critical/high risk wallet scan findings",
      "Suspicious token detected during pre-trade scan",
      "Monitoring detects a new risky asset",
      "Wallet safety score drops meaningfully",
      "Simulation detects a dangerous transaction or approval",
    ],
  };
}
