"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TransactionPoint } from "@/types";

interface TransactionActivityChartProps {
  data: TransactionPoint[];
}

interface TransactionTooltipPayload {
  value?: number | string;
}

interface TransactionTooltipProps {
  active?: boolean;
  payload?: TransactionTooltipPayload[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: TransactionTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-medium text-zinc-300 mb-1">{label}</p>
        <p className="text-emerald-400">{payload[0]?.value} txns</p>
      </div>
    );
  }
  return null;
}

export function TransactionActivityChart({ data }: TransactionActivityChartProps) {
  const gradientId = `tx-gradient-${useId().replace(/:/g, "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Transaction Activity</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#52525b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#52525b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="transactions"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
