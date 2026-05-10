"use client";

import { useState, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onAnalyze: (address: string) => void;
  isLoading?: boolean;
  className?: string;
}

const DEMO_ADDRESSES = [
  { label: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { label: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { label: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
];

export function SearchBar({ onAnalyze, isLoading, className }: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim() && !isLoading) onAnalyze(value.trim());
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Enter Solana token address or wallet…"
          disabled={isLoading}
          className={cn(
            "w-full pl-10 pr-32 py-3.5 rounded-xl text-sm font-mono",
            "bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600",
            "focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10",
            "transition-all duration-200 disabled:opacity-50"
          )}
        />
        {value && !isLoading && (
          <button
            onClick={() => setValue("")}
            className="absolute right-28 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <motion.button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className={cn(
            "absolute right-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium",
            "bg-emerald-500 text-black hover:bg-emerald-400",
            "disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Analyze
        </motion.button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-600">Quick scan:</span>
        {DEMO_ADDRESSES.map((demo) => (
          <motion.button
            key={demo.address}
            onClick={() => {
              setValue(demo.address);
              onAnalyze(demo.address);
            }}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-150 font-mono disabled:opacity-40"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {demo.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
