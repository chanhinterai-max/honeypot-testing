import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceChart as PriceChartData } from "../types";

const LOWS = { "1M": "#f3b2a8", "3M": "#e25b4a", "6M": "#8d2c22" } as const;
const HIGHS = { "1M": "#b7ebc9", "3M": "#3dbe7a", "6M": "#1d6b43" } as const;

function money(n: number): string {
  return new Intl.NumberFormat("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function PriceChart({ chart }: { chart: PriceChartData }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!chart?.points?.length) return null;

  const values = [
    ...chart.points.map((point) => point.close),
    ...chart.levels.flatMap((level) => [level.low, level.high]),
  ];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.08 || 1;

  return (
    <div className="mt-4">
      <div className="h-56 w-full min-w-0">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2c3d35" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#93a79c", fontSize: 11 }}
                tickFormatter={(value: string) => value.slice(5)}
                minTickGap={28}
                stroke="#2c3d35"
              />
              <YAxis
                domain={[min - pad, max + pad]}
                tick={{ fill: "#93a79c", fontSize: 11 }}
                tickFormatter={(value: number) => money(value)}
                width={64}
                stroke="#2c3d35"
              />
              <Tooltip
                contentStyle={{
                  background: "#16201b",
                  border: "1px solid #2c3d35",
                  borderRadius: 8,
                  color: "#e7efe9",
                }}
                formatter={(value) => [money(Number(value)), "Close"]}
              />
              {chart.levels.map((level) => (
                <ReferenceLine
                  key={`${level.window}-low`}
                  y={level.low}
                  stroke={LOWS[level.window]}
                  strokeWidth={level.window === "6M" ? 2 : 1.5}
                />
              ))}
              {chart.levels.map((level) => (
                <ReferenceLine
                  key={`${level.window}-high`}
                  y={level.high}
                  stroke={HIGHS[level.window]}
                  strokeWidth={level.window === "6M" ? 2 : 1.5}
                />
              ))}
              <Line
                type="monotone"
                dataKey="close"
                stroke="#7eb6ff"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <li style={{ color: "#7eb6ff" }}>Close, 6 months</li>
        {chart.levels.map((level) => (
          <li key={level.window} className="flex gap-3">
            <span style={{ color: LOWS[level.window] }}>
              {level.window} low {money(level.low)}
            </span>
            <span style={{ color: HIGHS[level.window] }}>
              {level.window} high {money(level.high)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
