import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  MarketPriceHistoryChartRow,
  MarketPriceHistoryVisibleOption,
} from "../lib/priceHistoryChart";

type TooltipEntry = { name: string; value: number; color: string };

type CustomTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipEntry[];
};

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">{entry.name}</span>
          <span className="ml-auto pl-4 font-medium text-foreground">
            {entry.value.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

type MarketPriceHistoryChartProps = {
  chartData: MarketPriceHistoryChartRow[];
  visibleOptions: MarketPriceHistoryVisibleOption[];
};

export function MarketPriceHistoryChart({
  chartData,
  visibleOptions,
}: MarketPriceHistoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
        <XAxis
          dataKey="timeLabel"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        {visibleOptions.map((option) => (
          <Line
            key={option.optionId}
            type="monotone"
            dataKey={option.dataKey}
            name={option.content}
            stroke={option.color}
            strokeWidth={2}
            dot={chartData.length === 1 ? { r: 4 } : false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
