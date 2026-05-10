"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type {
  MonitorWalletResponse,
  ScoreHistoryPoint,
  SimulationResponse,
  TokenScanResponse,
  WalletScanResponse,
} from "@shared/types";
import { getScoreHistory, monitorWallet, scanToken, scanWallet, simulateTransaction } from "@/lib/api";

export function useWalletRiskScan() {
  const { publicKey, connected } = useWallet();
  const [walletScan, setWalletScan] = useState<WalletScanResponse | null>(null);
  const [tokenScan, setTokenScan] = useState<TokenScanResponse | null>(null);
  const [monitorScan, setMonitorScan] = useState<MonitorWalletResponse | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [isScanningWallet, setIsScanningWallet] = useState(false);
  const [isScanningToken, setIsScanningToken] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const walletAddress = publicKey?.toBase58() || "";

  const runWalletScan = useCallback(async () => {
    if (!walletAddress) return;
    console.log("[SolGuard wallet] scan triggered:", walletAddress);
    setIsScanningWallet(true);
    setError(null);
    try {
      const scan = await scanWallet(walletAddress);
      setWalletScan(scan);
      setScoreHistory(scan.scoreHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet scan failed");
    } finally {
      setIsScanningWallet(false);
    }
  }, [walletAddress]);

  const runTokenScan = useCallback(async (mintAddress: string) => {
    if (!mintAddress.trim()) return;
    setIsScanningToken(true);
    setError(null);
    try {
      setTokenScan(await scanToken(mintAddress.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token scan failed");
    } finally {
      setIsScanningToken(false);
    }
  }, []);

  const runSimulation = useCallback(async (mintAddress?: string) => {
    setIsSimulating(true);
    setError(null);
    try {
      setSimulation(await simulateTransaction({ walletAddress, mintAddress, amount: "unknown" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  }, [walletAddress]);

  const runMonitorScan = useCallback(async () => {
    if (!walletAddress) return;
    try {
      setMonitorScan(await monitorWallet(walletAddress));
      const history = await getScoreHistory(walletAddress);
      setScoreHistory(history.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Monitor scan failed");
    }
  }, [walletAddress]);

  useEffect(() => {
    if (connected && walletAddress) {
      const timer = setTimeout(() => void runWalletScan(), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setWalletScan(null);
      setMonitoring(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [connected, runWalletScan, walletAddress]);

  useEffect(() => {
    if (!monitoring || !walletAddress) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    const timer = setTimeout(() => void runMonitorScan(), 0);
    intervalRef.current = setInterval(() => void runMonitorScan(), 45_000);
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [monitoring, runMonitorScan, walletAddress]);

  return {
    walletAddress,
    walletScan,
    tokenScan,
    monitorScan,
    simulation,
    scoreHistory,
    isScanningWallet,
    isScanningToken,
    isSimulating,
    monitoring,
    error,
    connected,
    setMonitoring,
    runWalletScan,
    runTokenScan,
    runSimulation,
  };
}
