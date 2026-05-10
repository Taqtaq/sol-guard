"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConnectionProvider, useWallet, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork, WalletConnectionError, WalletReadyState } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { Toaster } from "@/components/ui/sonner";
import "@solana/wallet-adapter-react-ui/styles.css";

function dispatchWalletState(type: string, detail: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

function WalletLifecycleBridge() {
  const { wallet, connecting, connected, publicKey, connect } = useWallet();
  const [connectRequested, setConnectRequested] = useState(false);
  const connectingRef = useRef(false);
  const walletName = wallet?.adapter.name;
  const publicKeyText = publicKey?.toBase58();

  const markError = useCallback((error: unknown) => {
    const err = error instanceof Error ? error : new Error("Wallet connection failed");
    const rejected =
      err instanceof WalletConnectionError ||
      err.name.toLowerCase().includes("reject") ||
      err.message.toLowerCase().includes("reject");
    console.warn("[SolGuard wallet] error:", rejected ? "rejected" : err.name, err.message);
    dispatchWalletState("solguard-wallet-error", { rejected, message: err.message });
  }, []);

  useEffect(() => {
    const handleConnectRequested = () => {
      console.log("[SolGuard wallet] connect requested");
      setConnectRequested(true);
      dispatchWalletState("solguard-wallet-state", { state: "disconnected" });
    };
    window.addEventListener("solguard-wallet-connect-requested", handleConnectRequested);
    return () => window.removeEventListener("solguard-wallet-connect-requested", handleConnectRequested);
  }, []);

  useEffect(() => {
    if (walletName) console.log("[SolGuard wallet] wallet selected:", walletName);
    if (walletName) dispatchWalletState("solguard-wallet-selected", { walletName });
  }, [walletName]);

  useEffect(() => {
    if (connecting) {
      console.log("[SolGuard wallet] connecting");
      dispatchWalletState("solguard-wallet-state", { state: "connecting" });
    }
  }, [connecting]);

  useEffect(() => {
    if (connected) {
      console.log("[SolGuard wallet] connected");
      connectingRef.current = false;
      dispatchWalletState("solguard-wallet-state", { state: "connected" });
      const timer = setTimeout(() => setConnectRequested(false), 0);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  useEffect(() => {
    if (publicKeyText) console.log("[SolGuard wallet] publicKey:", publicKeyText);
  }, [publicKeyText]);

  useEffect(() => {
    if (!connectRequested || !wallet || connected || connecting || connectingRef.current) return;
    if (wallet.adapter.readyState === WalletReadyState.Unsupported) {
      markError(new Error(`${wallet.adapter.name} is not supported in this browser.`));
      const timer = setTimeout(() => setConnectRequested(false), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      connectingRef.current = true;
      dispatchWalletState("solguard-wallet-state", { state: "connecting" });
      console.log("[SolGuard wallet] connecting via adapter:", wallet.adapter.name, wallet.adapter.readyState);
      void connect()
        .catch((error) => {
          markError(error);
          setConnectRequested(false);
        })
        .finally(() => {
          connectingRef.current = false;
        });
    }, 0);
    return () => clearTimeout(timer);
  }, [connect, connectRequested, connected, connecting, markError, wallet]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );
  const onWalletError = (error: Error) => {
    const rejected =
      error instanceof WalletConnectionError ||
      error.name.toLowerCase().includes("reject") ||
      error.message.toLowerCase().includes("reject");
    console.warn("[SolGuard wallet] provider error:", rejected ? "rejected" : error.name, error.message);
    dispatchWalletState("solguard-wallet-error", { rejected, message: error.message });
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        localStorageKey="solguard-wallet"
        onError={onWalletError}
      >
        <WalletModalProvider>
          <WalletLifecycleBridge />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#18181b",
                border: "1px solid #27272a",
                color: "#fafafa",
              },
            }}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
