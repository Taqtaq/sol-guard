"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const SIGNALS = [
  { label: "Mint Authority", x: -130, y: -40,  delay: 0    },
  { label: "Holder Distribution", x: 110,  y: -55,  delay: 0.4  },
  { label: "Freeze Authority", x: -120, y: 55,  delay: 0.8  },
  { label: "Liquidity Depth", x: 105,  y: 60,  delay: 1.2  },
  { label: "Token Age",        x: -30,  y: 120, delay: 1.6  },
];

export function EmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center py-28 overflow-hidden select-none">

      {/* Ambient dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft green radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

      {/* Orbital rings */}
      {[110, 155, 200].map((r, i) => (
        <motion.div
          key={r}
          className="absolute rounded-full border border-zinc-800/50"
          style={{ width: r * 2, height: r * 2 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 18 + i * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Floating signal labels */}
      {SIGNALS.map((s) => (
        <motion.div
          key={s.label}
          className="absolute"
          style={{ x: s.x, y: s.y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3.5, delay: s.delay, repeat: Infinity, repeatDelay: 2 }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] whitespace-nowrap">
            <motion.div
              className="w-1 h-1 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            {s.label}
          </div>
        </motion.div>
      ))}

      {/* Center shield */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
            animate={{ boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 30px rgba(16,185,129,0.12)", "0 0 0px rgba(16,185,129,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Shield className="w-7 h-7 text-zinc-700" />
          </motion.div>

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <h3 className="text-base font-medium text-zinc-300 mb-2">
          Ready to scan
        </h3>
        <p className="text-sm text-zinc-600 max-w-[260px] text-center leading-relaxed">
          Enter any Solana token address above to run a full AI security analysis.
        </p>
      </div>
    </div>
  );
}
