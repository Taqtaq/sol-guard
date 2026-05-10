import { PublicKey } from "@solana/web3.js";

export function nowIso() {
  return new Date().toISOString();
}

export function toPublicKey(value, label) {
  try {
    return new PublicKey(value);
  } catch {
    const err = new Error(`Invalid ${label}. Expected a Solana base58 address.`);
    err.status = 400;
    throw err;
  }
}

export function riskLevelFromScore(score) {
  if (score >= 85) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "SAFE";
}

export function verdictFromScore(score) {
  if (score >= 85) return "AVOID";
  if (score >= 60) return "HIGH RISK";
  if (score >= 30) return "CAUTION";
  return "SAFE";
}

export function flag(id, label, severity, explanation, status = "warning", evidence = undefined) {
  return { id, label, severity, explanation, status, evidence };
}

export function uiAmount(rawAmount, decimals) {
  const raw = BigInt(rawAmount || "0");
  if (decimals === 0) return raw.toString();
  const scale = 10n ** BigInt(decimals);
  const whole = raw / scale;
  const fraction = raw % scale;
  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionText ? `${whole}.${fractionText}` : whole.toString();
}

export function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

export function percentFromRaw(partRaw, totalRaw) {
  const total = BigInt(totalRaw || "0");
  if (total === 0n) return null;
  return Number((BigInt(partRaw || "0") * 10000n) / total) / 100;
}

export function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function unavailable(id, label, explanation) {
  return flag(id, label, "SAFE", explanation, "unknown");
}
