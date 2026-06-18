import { Link } from "react-router-dom";

import { MARKET_LABELS } from "@/entities/market/lib/marketLabels";
import { getOptionColorMap } from "@/entities/market/lib/optionColor";
import type { MarketSummary } from "@/entities/market/model/market.types";
import { toDecimal } from "@/shared/lib/decimal";
import { formatDday } from "@/shared/lib/formatDate";
import { formatPercent, formatPointAmount } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type PopularMarketCardProps = {
  market: MarketSummary;
};

export function PopularMarketCard({ market }: PopularMarketCardProps) {
  const colorMap = getOptionColorMap(
    market.options.map((option) => option.optionId),
  );

  // 우세 선택지(가격 최댓값)만 옵션색 강조. 동점이면 강조 없음.
  const maxPrice = market.options.reduce(
    (max, option) => {
      const price = toDecimal(option.currentPrice);
      return price.greaterThan(max) ? price : max;
    },
    toDecimal(market.options[0]?.currentPrice ?? "0"),
  );
  const leaders = market.options.filter((option) =>
    toDecimal(option.currentPrice).equals(maxPrice),
  );
  const leaderId = leaders.length === 1 ? leaders[0].optionId : undefined;

  const deadlineLabel =
    market.displayStatus === "CLOSED_BY_TIME"
      ? "마감"
      : formatDday(market.closeAt);

  // 인기 정렬 기준과 동일한 실제 참여 볼륨. 없으면 totalPoolAmount로 폴백.
  const volume = market.totalRealPoolAmount ?? market.totalPoolAmount;

  return (
    <Link
      to={`/markets/${market.marketId}`}
      className="group block h-full focus-visible:outline-none"
    >
      <Card className="h-full gap-3 ring-foreground/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-emerald-500">
        <CardHeader className="gap-2">
          <div className="flex items-center justify-end">
            <span className="text-xs text-muted-foreground">{deadlineLabel}</span>
          </div>
          <CardTitle className="line-clamp-2 min-h-11 text-[15px] font-medium leading-snug text-foreground">
            {market.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {market.options.map((option) => {
              const color = colorMap[option.optionId];
              const isLeader = option.optionId === leaderId;

              return (
                <div
                  key={option.optionId}
                  className={cn(
                    "rounded-lg border px-3 py-2",
                    isLeader ? "" : "border-border bg-secondary/40",
                  )}
                  style={
                    isLeader
                      ? {
                          borderColor: color?.base,
                          backgroundColor: `${color?.base}1a`,
                        }
                      : undefined
                  }
                >
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {option.content}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-lg font-medium tabular-nums",
                      !isLeader && "text-foreground",
                    )}
                    style={isLeader ? { color: color?.darker } : undefined}
                  >
                    {formatPercent(option.currentPrice)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-xs">
            <span className="text-muted-foreground">
              {MARKET_LABELS.liquidity}{" "}
              <strong className="font-medium tabular-nums text-foreground">
                {formatPointAmount(volume)}
              </strong>
            </span>
            <span className="font-medium text-emerald-700 group-hover:underline">
              예측하기 &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
