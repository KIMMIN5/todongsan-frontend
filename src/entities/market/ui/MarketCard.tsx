import { Link } from "react-router-dom";

import { formatDateTime } from "@/shared/lib/formatDate";
import { formatPercent, formatPointAmount } from "@/shared/lib/formatDecimal";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { MarketSummary } from "../model/market.types";
import { MarketStatusBadge } from "./MarketStatusBadge";

type MarketCardProps = {
  market: MarketSummary;
};

export function MarketCard({ market }: MarketCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            #{market.marketId}
          </span>
          <MarketStatusBadge displayStatus={market.displayStatus} />
        </div>
        <CardTitle className="line-clamp-2 min-h-11 text-base font-semibold">
          <Link
            to={`/markets/${market.marketId}`}
            className="hover:text-emerald-700"
          >
            {market.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid gap-2">
          {market.options.map((option) => (
            <div
              key={option.optionId}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2"
            >
              <span className="line-clamp-1 text-sm font-medium">
                {option.content}
              </span>
              <span className="shrink-0 text-sm font-semibold text-emerald-700">
                {formatPercent(option.currentPrice)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            풀{" "}
            <strong className="font-semibold text-foreground">
              {formatPointAmount(market.totalPoolAmount)}
            </strong>
          </span>
          <span>마감 {formatDateTime(market.closeAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
