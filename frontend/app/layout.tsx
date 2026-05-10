import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SolGuard AI — AI Security Layer for Solana",
  description:
    "Detect scam tokens, suspicious wallets, and risky on-chain activity using AI.",
  keywords: ["Solana", "AI", "security", "token analysis", "scam detection"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
