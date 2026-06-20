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

const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** 축 tick: 구간이 하루 이하이면 "HH:mm", 그보다 길면 "M/D". */
function formatAxisTick(ms: number, spanMs: number): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  return spanMs <= DAY_MS
    ? `${pad(date.getHours())}:${pad(date.getMinutes())}`
    : `${date.getMonth() + 1}/${date.getDate()}`;
}

/** 툴팁 시각: "M/D HH:mm". */
function formatFullTime(ms: number): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type TooltipEntry = { name: string; value: number; color: string };

type CustomTooltipProps = {
  active?: boolean;
  label?: number;
  payload?: TooltipEntry[];
};

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1.5 text-xs text-muted-foreground">
        {label !== undefined ? formatFullTime(label) : ""}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">{entry.name}</span>
          <span className="ml-auto pl-4 font-medium tabular-nums text-foreground">
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

type MarketPriceHistoryChartProps = {
  chartData: MarketPriceHistoryChartRow[];
  visibleOptions: MarketPriceHistoryVisibleOption[];
  xDomain: [number, number] | undefined;
};

export function MarketPriceHistoryChart({
  chartData,
  visibleOptions,
  xDomain,
}: MarketPriceHistoryChartProps) {
  const spanMs = xDomain ? xDomain[1] - xDomain[0] : DAY_MS;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
        <XAxis
          dataKey="t"
          type="number"
          domain={xDomain ?? ["dataMin", "dataMax"]}
          scale="time"
          tickCount={5}
          tickFormatter={(value: number) => formatAxisTick(value, spanMs)}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
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
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
