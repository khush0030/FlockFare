"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { PricePoint } from "@/lib/supabase/price-history";

function formatPrice(value: number): string {
  return `\u20B9${(value / 1000).toFixed(0)}k`;
}

export function PriceChart({
  data,
  baseline,
}: {
  data: PricePoint[];
  baseline?: number;
}) {
  if (data.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-ffgray-400 font-mono text-sm">
        Not enough data yet. Check back in a few days.
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.15 || 1000;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D28FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6D28FF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#9C9C98" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatPrice}
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#9C9C98" }}
            axisLine={false}
            tickLine={false}
            domain={[minPrice - padding, maxPrice + padding]}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "#0B0B0F",
              border: "2px solid #6D28FF",
              borderRadius: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#D8FF3C",
            }}
            formatter={(value) => [
              `\u20B9${Number(value).toLocaleString("en-IN")}`,
              "Price",
            ]}
            labelStyle={{ color: "#9C9C98" }}
          />
          {baseline && (
            <ReferenceLine
              y={baseline}
              stroke="#FF4E64"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `Baseline ${formatPrice(baseline)}`,
                position: "right",
                fill: "#FF4E64",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#6D28FF"
            strokeWidth={3}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#D8FF3C",
              stroke: "#0B0B0F",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
