import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { createAlert, sendTelegramAlert } from "./alertEngine.js";
import { readScoreHistory } from "./historyStore.js";
import { monitorWallet } from "./monitoring.js";
import { simulateTransaction } from "./simulation.js";
import { analyzeMint } from "./tokenAnalysis.js";
import { flag, nowIso, toPublicKey } from "./utils.js";
import { scanWallet } from "./walletScan.js";

export const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "solguard-backend",
    rpcSource: config.rpcUrl,
    heliusEnabled: Boolean(config.heliusApiKey),
    birdeyeEnabled: Boolean(config.birdeyeApiKey),
    telegramConfigured: Boolean(config.telegramBotToken && config.telegramChatId),
    timestamp: nowIso(),
  });
});

app.post("/api/scan-wallet", async (req, res, next) => {
  try {
    res.json(await scanWallet(req.body.walletAddress));
  } catch (error) {
    next(error);
  }
});

app.post("/api/scan-token", async (req, res, next) => {
  try {
    const mintAddress = req.body.mintAddress;
    const scannedAt = nowIso();
    const asset = await analyzeMint(mintAddress);
    const unavailableCount = asset.riskFlags.filter((riskFlag) => riskFlag.status === "unknown").length;
    res.json({
      mintAddress,
      riskScore: asset.riskScore,
      riskLevel: asset.riskLevel,
      verdict: asset.verdict,
      confidence: asset.confidence,
      summary: [
        ...asset.riskFlags.filter((riskFlag) => riskFlag.status !== "unknown").map((riskFlag) => riskFlag.label),
        `${unavailableCount} checks unavailable`,
      ],
      asset,
      alerts: asset.riskFlags
        .filter((riskFlag) => ["HIGH", "CRITICAL"].includes(riskFlag.severity))
        .map((riskFlag) => createAlert(riskFlag, {
          mintAddress,
          source: "pre-trade",
          evidence: { symbol: asset.symbol, riskScore: asset.riskScore, flagEvidence: riskFlag.evidence },
        })),
      whaleSummary: asset.whaleSummary,
      evidence: {
        mintAddress,
        rpcSource: config.rpcUrl,
        tokenAccountsFound: 0,
        parsedTokenAccounts: 0,
        scannedAt,
        notes: [
          "Pre-trade scan checks mint-level authorities, metadata, liquidity, holder concentration, and configured scam sources.",
          "Unavailable data is shown separately and is not treated as direct scam evidence.",
        ],
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/monitor-wallet", async (req, res, next) => {
  try {
    res.json(await monitorWallet(req.body.walletAddress));
  } catch (error) {
    next(error);
  }
});

app.post("/api/simulate-transaction", async (req, res, next) => {
  try {
    res.json(await simulateTransaction(req.body || {}));
  } catch (error) {
    next(error);
  }
});

app.get("/api/score-history/:wallet", (req, res, next) => {
  try {
    const wallet = req.params.wallet;
    toPublicKey(wallet, "wallet");
    const history = readScoreHistory();
    res.json({ walletAddress: wallet, history: history[wallet] || [] });
  } catch (error) {
    next(error);
  }
});

app.post("/api/telegram/test-alert", async (req, res, next) => {
  try {
    const testAlert = createAlert(
      flag("telegram-test", "SolGuard Telegram test", "MEDIUM", "This is a test alert from the SolGuard backend.", "warning"),
      { source: "manual-test", evidence: req.body?.evidence || { manual: true } }
    );
    res.json({ alert: testAlert, telegram: await sendTelegramAlert(testAlert) });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || "Unexpected backend error",
    status,
    timestamp: nowIso(),
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`SolGuard backend listening on http://127.0.0.1:${config.port}`);
  });
}
