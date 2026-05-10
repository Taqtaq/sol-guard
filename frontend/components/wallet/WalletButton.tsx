"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet, ChevronDown, LogOut, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, formatAddress } from "@/lib/utils";

interface WalletButtonProps {
  variant?: "default" | "compact";
  className?: string;
}

type WalletUiState = "disconnected" | "connecting" | "connected" | "rejected" | "error";

export function WalletButton({ variant = "default", className }: WalletButtonProps) {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect, connecting, connected } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletState, setWalletState] = useState<WalletUiState>("disconnected");
  const isCompact = variant === "compact";

  useEffect(() => {
    if (connected && publicKey) {
      const timer = setTimeout(() => setWalletState("connected"), 0);
      return () => clearTimeout(timer);
    }
    if (connecting) {
      const timer = setTimeout(() => setWalletState("connecting"), 0);
      return () => clearTimeout(timer);
    }
  }, [connected, connecting, publicKey]);

  useEffect(() => {
    const handleWalletError = (event: Event) => {
      const detail = (event as CustomEvent<{ rejected?: boolean }>).detail;
      setWalletState(detail?.rejected ? "rejected" : "error");
    };
    const handleWalletState = (event: Event) => {
      const state = (event as CustomEvent<{ state?: WalletUiState }>).detail?.state;
      if (state) setWalletState(state);
    };
    window.addEventListener("solguard-wallet-error", handleWalletError);
    window.addEventListener("solguard-wallet-state", handleWalletState);
    return () => {
      window.removeEventListener("solguard-wallet-error", handleWalletError);
      window.removeEventListener("solguard-wallet-state", handleWalletState);
    };
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } finally {
      setMenuOpen(false);
      setWalletState("disconnected");
      console.log("[SolGuard wallet] disconnected");
    }
  };

  if (publicKey) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
            "hover:bg-emerald-500/20 transition-all duration-200",
            isCompact && "px-2",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={cn("text-sm font-mono", isCompact && "hidden sm:inline")}>
            {formatAddress(publicKey.toBase58())}
          </span>
          <ChevronDown className={cn("w-3 h-3 opacity-60", isCompact && "hidden sm:block")} />
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl z-50"
            >
              <button
                onClick={() => void handleDisconnect()}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-zinc-300 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => {
        console.log("[SolGuard wallet] connect modal opened");
        setWalletState("disconnected");
        window.dispatchEvent(new CustomEvent("solguard-wallet-connect-requested"));
        setVisible(true);
      }}
      disabled={connecting}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
        "bg-zinc-900 border border-zinc-700 text-zinc-300",
        "hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5",
        "transition-all duration-200 disabled:opacity-50",
        isCompact && "px-3",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {walletState === "rejected" || walletState === "error" ? (
        <AlertCircle className="w-4 h-4 text-amber-300" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      <span className={cn(isCompact && "hidden sm:inline")}>
        {walletState === "connecting"
          ? "Connecting..."
          : walletState === "rejected"
            ? "Request rejected"
            : walletState === "error"
              ? "Wallet error"
              : "Connect Wallet"}
      </span>
    </motion.button>
  );
}
