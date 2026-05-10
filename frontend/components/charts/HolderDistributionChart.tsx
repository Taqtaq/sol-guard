"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HolderData } from "@/types";
import type { ReactNode } from "react";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#10b981", "#6366f1"];

interface HolderDistributionChartProps {
  data: HolderData[];
}

interface ChartPayload<TPayload> {
  payload: TPayload;
}

interface TooltipProps<TPayload> {
  active?: boolean;
  payload?: Array<ChartPayload<TPayload>>;
}

interface LegendEntry {
  color?: string;
  value?: ReactNode;
}

function CustomTooltip({ active, payload }: TooltipProps<HolderData>) {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-medium text-zinc-200">{d.name}</p>
        <p className="text-zinc-400 mt-0.5">{d.percentage}% of supply</p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-zinc-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function HolderDistributionChart({ data }: HolderDistributionChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Holder Distribution</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="percentage"
              nameKey="name"
            >
              {data.map((holder, idx) => (
                <Cell
                  key={`${holder.name}-${holder.percentage}`}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
