import { toDecimal } from "@/shared/lib/decimal";
import { decimalToPercentValue, formatPercent } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

import { MARKET_CAPTIONS } from "../lib/marketLabels";
import { getOptionColorMap } from "../lib/optionColor";
import type { MarketOption } from "../model/market.types";

type MarketOptionListProps = {
  options: MarketOption[];
};

export function MarketOptionList({ options }: MarketOptionListProps) {
  // 색은 optionId 고정 배정(가격과 무관). 단일 소스 헬퍼에서 가져온다.
  const colorMap = getOptionColorMap(options.map((option) => option.optionId));

  // 1위 강조용: currentPrice 최댓값을 구하고, 최댓값이 유일할 때만 강조한다(동점이면 강조 없음).
  const maxPrice = options.reduce(
    (max, option) => {
      const price = toDecimal(option.currentPrice);
      return price.greaterThan(max) ? price : max;
    },
    toDecimal(options[0]?.currentPrice ?? "0"),
  );
  const leaderCount = options.filter((option) =>
    toDecimal(option.currentPrice).equals(maxPrice),
  ).length;
  const leaderId =
    leaderCount === 1
      ? options.find((option) =>
          toDecimal(option.currentPrice).equals(maxPrice),
        )?.optionId
      : undefined;

  return (
    <div className="space-y-3">
      <div className="space-y-4">
      {options.map((option) => {
        const color = colorMap[option.optionId];
        const isLeader = option.optionId === leaderId;

        return (
          <div key={option.optionId} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">
                {option.content}
              </span>
              <div className="flex items-center gap-2">
                {isLeader && (
                  <Badge
                    className="border-transparent"
                    style={{
                      backgroundColor: `${color.base}1a`,
                      color: color.darker,
                    }}
                  >
                    1위
                  </Badge>
                )}
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    isLeader ? "font-semibold" : "font-medium text-foreground",
                  )}
                  style={isLeader ? { color: color.darker } : undefined}
                >
                  {formatPercent(option.currentPrice)}
                </span>
              </div>
            </div>
            <div className="h-[5px] w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${decimalToPercentValue(option.currentPrice)}%`,
                  backgroundColor: color.base,
                }}
              />
            </div>
          </div>
        );
      })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {MARKET_CAPTIONS.predictionRate}
      </p>
    </div>
  );
}
