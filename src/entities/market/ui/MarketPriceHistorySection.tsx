import { Suspense, lazy, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { formatPercent } from "@/shared/lib/formatDecimal";
import { useInView } from "@/shared/lib/useInView";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";

import { buildMarketPriceHistoryChartData } from "../lib/priceHistoryChart";
import { useMarketPriceHistoryQuery } from "../model/useMarketPriceHistoryQuery";
import type { MarketOption } from "../model/market.types";

// Recharts는 무거우므로 차트 컴포넌트(및 recharts)를 별도 chunk로 분리합니다.
const MarketPriceHistoryChart = lazy(() =>
  import("./MarketPriceHistoryChart").then((module) => ({
    default: module.MarketPriceHistoryChart,
  })),
);

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
  // 차트(및 recharts chunk)는 차트 영역이 viewport에 들어올 때만 로드합니다.
  const { ref: chartAreaRef, inView: isChartInView } =
    useInView<HTMLDivElement>();
  const params = useMemo(
    () => ({
      page: PAGE,
      size: SIZE,
      ...(selectedOptionId !== undefined ? { optionId: selectedOptionId } : {}),
    }),
    [selectedOptionId],
  );
  const { data, error, isError, isLoading, refetch } =
    useMarketPriceHistoryQuery(marketId, params);

  const { chartData, visibleOptions, latestPrices } = useMemo(
    () =>
      buildMarketPriceHistoryChartData({
        options,
        histories: data?.content ?? [],
        selectedOptionId,
      }),
    [options, data?.content, selectedOptionId],
  );

  const errorMessage = isApiError(error)
    ? error.message
    : error instanceof Error
    ? error.message
    : "가격 변화 이력을 불러오는 중 문제가 발생했습니다.";

  const hasHistory = (data?.content.length ?? 0) > 0;

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

      <CardContent className="space-y-4">
        {isLoading && <MarketPriceHistoryChartSkeleton />}

        {isError && (
          <ErrorState
            title="가격 변화를 불러오지 못했습니다"
            message={errorMessage}
            action={<Button onClick={() => refetch()}>다시 시도</Button>}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            <div ref={chartAreaRef}>
              {isChartInView ? (
                <Suspense fallback={<ChartAreaSkeleton />}>
                  <MarketPriceHistoryChart
                    chartData={chartData}
                    visibleOptions={visibleOptions}
                  />
                </Suspense>
              ) : (
                <ChartAreaSkeleton />
              )}
            </div>

            {!hasHistory && (
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <TrendingUp className="size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  아직 가격 변화 이력이 없습니다.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  첫 예측 참여가 확정되면 가격 변화가 표시됩니다.
                </p>
              </div>
            )}

            {latestPrices.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  최신 가격
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {latestPrices.map((latest) => (
                    <div
                      key={latest.optionId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {latest.content}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatPercent(latest.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ChartAreaSkeleton() {
  return <Skeleton className="h-[240px] w-full" />;
}

function MarketPriceHistoryChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[240px] w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
