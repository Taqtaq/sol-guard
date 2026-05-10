import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "LOW":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "HIGH":
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "CRITICAL":
      return "bg-red-500/10 text-red-400 border-red-500/30";
  }
}

export function getRiskScoreColor(score: number): string {
  if (score <= 25) return "text-emerald-400";
  if (score <= 50) return "text-yellow-400";
  if (score <= 75) return "text-orange-400";
  return "text-red-400";
}

export function getRiskGlowClass(score: number): string {
  if (score <= 25) return "shadow-emerald-500/20";
  if (score <= 50) return "shadow-yellow-500/20";
  if (score <= 75) return "shadow-orange-500/20";
  return "shadow-red-500/20";
}

export function formatAddress(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
