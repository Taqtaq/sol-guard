import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Connection } from "@solana/web3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 8000),
  rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  frontendOrigins: (process.env.FRONTEND_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  heliusApiKey: process.env.HELIUS_API_KEY || "",
  birdeyeApiKey: process.env.BIRDEYE_API_KEY || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  knownScamMints: new Set(
    (process.env.KNOWN_SCAM_MINTS || "")
      .split(",")
      .map((mint) => mint.trim())
      .filter(Boolean)
  ),
  dataDir: path.resolve(__dirname, "..", "data"),
};

export const connection = new Connection(config.rpcUrl, "confirmed");

export const trustedMints = new Map([
  ["So11111111111111111111111111111111111111112", { name: "Wrapped SOL", symbol: "SOL" }],
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", { name: "USD Coin", symbol: "USDC" }],
  ["Es9vMFrzaCERmJfrF4H2FYD4MxE6DrtUS9mGvGy8gV", { name: "Tether USD", symbol: "USDT" }],
  ["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", { name: "Jupiter", symbol: "JUP" }],
]);
