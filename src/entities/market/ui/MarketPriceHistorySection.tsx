import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { formatDateTime } from "@/shared/lib/formatDate";
import { formatMarketPrice, formatPercent } from "@/shared/lib/formatDecimal";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";

import { useMarketPriceHistoryQuery } from "../model/useMarketPriceHistoryQuery";
import type { MarketOption, MarketPriceHistoryItem } from "../model/market.types";

type MarketPriceHistorySectionProps = {
  marketId: number;
  options: MarketOption[];
};

const PAGE = 0;
const SIZE = 50;

export function MarketPriceHistorySection({
  marketId,
  options,
}: MarketPriceHistorySectionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | undefined>();
  const params = useMemo(
    () => ({
      page: PAGE,
      size: SIZE,
      ...(selectedOptionId ? { optionId: selectedOptionId } : {}),
    }),
    [selectedOptionId],
  );
  const { data, error, isError, isLoading, refetch } =
    useMarketPriceHistoryQuery(marketId, params);

  const errorMessage = isApiError(error)
    ? error.message
    : error instanceof Error
    ? error.message
    : "가격 변화 이력을 불러오는 중 문제가 발생했습니다.";

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>가격 변화</CardTitle>
          <span className="text-xs text-muted-foreground">
            최근 {SIZE}개 이력
          </span>
        </div>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedOptionId === undefined ? "default" : "outline"}
              onClick={() => setSelectedOptionId(undefined)}
            >
              전체
            </Button>
            {options.map((option) => (
              <Button
                key={option.optionId}
                type="button"
                size="sm"
                variant={
                  selectedOptionId === option.optionId ? "default" : "outline"
                }
                onClick={() => setSelectedOptionId(option.optionId)}
              >
                {option.content}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && <MarketPriceHistorySkeleton />}

        {isError && (
          <ErrorState
            title="가격 변화 이력을 불러오지 못했습니다"
            message={errorMessage}
            action={<Button onClick={() => refetch()}>다시 시도</Button>}
          />
        )}

        {!isLoading && !isError && data && data.content.length === 0 && (
          <EmptyState
            title="아직 가격 변동 이력이 없습니다"
            description="예측 참여가 발생하면 선택지별 가격 변화가 표시됩니다."
            icon={<TrendingUp className="size-10 text-muted-foreground/60" />}
          />
        )}

        {!isLoading && !isError && data && data.content.length > 0 && (
          <MarketPriceHistoryList items={data.content} />
        )}
      </CardContent>
    </Card>
  );
}

type MarketPriceHistoryListProps = {
  items: MarketPriceHistoryItem[];
};

function MarketPriceHistoryList({ items }: MarketPriceHistoryListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.historyId}
          className="rounded-lg border border-border bg-muted/20 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {item.optionContent}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-foreground">
                {formatPercent(item.priceBefore)} -&gt;{" "}
                {formatPercent(item.priceAfter)}
              </p>
              <p
                className={
                  item.priceChangeRate.startsWith("-")
                    ? "mt-1 text-xs font-medium text-destructive"
                    : "mt-1 text-xs font-medium text-emerald-700"
                }
              >
                {formatPercentPoint(item.priceChangeRate)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPercentPoint(value: string | null | undefined): string {
  const formatted = formatMarketPrice(value);
  return formatted === "-" ? "-" : `${formatted}%`;
}

function MarketPriceHistorySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
