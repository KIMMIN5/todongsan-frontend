import { Suspense, lazy, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { toDecimal } from "@/shared/lib/decimal";
import { formatPercent } from "@/shared/lib/formatDecimal";
import { useInView } from "@/shared/lib/useInView";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";

import { getOptionColorMap } from "../lib/optionColor";
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

  // 탭/최신가 색은 차트 라인과 동일한 단일 소스(optionId 고정)를 사용한다.
  const optionColorMap = useMemo(
    () => getOptionColorMap(options.map((option) => option.optionId)),
    [options],
  );

  // 1위 강조: currentPrice 최댓값이 유일할 때만(동점이면 강조 없음).
  const leaderOptionId = useMemo(() => {
    if (options.length === 0) return undefined;
    const maxPrice = options.reduce(
      (max, option) => {
        const price = toDecimal(option.currentPrice);
        return price.greaterThan(max) ? price : max;
      },
      toDecimal(options[0]?.currentPrice ?? "0"),
    );
    const leaders = options.filter((option) =>
      toDecimal(option.currentPrice).equals(maxPrice),
    );
    return leaders.length === 1 ? leaders[0].optionId : undefined;
  }, [options]);

  const { chartData, visibleOptions, latestPrices, xDomain } = useMemo(
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
                <span
                  className="mr-1.5 inline-block size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: optionColorMap[option.optionId]?.base,
                  }}
                />
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
            {hasHistory ? (
              <div ref={chartAreaRef}>
                {isChartInView ? (
                  <Suspense fallback={<ChartAreaSkeleton />}>
                    <MarketPriceHistoryChart
                      chartData={chartData}
                      visibleOptions={visibleOptions}
                      xDomain={xDomain}
                    />
                  </Suspense>
                ) : (
                  <ChartAreaSkeleton />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
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
              <div className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    최신 가격
                  </p>
                  <span className="text-[11px] text-muted-foreground/70">
                    실시간
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {latestPrices.map((latest) => {
                    const color = optionColorMap[latest.optionId];
                    const isLeader = latest.optionId === leaderOptionId;

                    return (
                      <div
                        key={latest.optionId}
                        className={cn(
                          "rounded-lg p-3",
                          !isLeader && "bg-secondary",
                        )}
                        style={
                          isLeader
                            ? { backgroundColor: `${color?.base}1a` }
                            : undefined
                        }
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex min-w-0 items-start gap-1.5">
                            <span
                              className="mt-0.5 inline-block size-2 shrink-0 rounded-full"
                              style={{ backgroundColor: color?.base }}
                            />
                            <span
                              className={cn(
                                "line-clamp-2 text-[11px] leading-tight",
                                !isLeader && "text-muted-foreground",
                              )}
                              style={
                                isLeader ? { color: color?.darker } : undefined
                              }
                            >
                              {latest.content || "-"}
                            </span>
                          </div>
                          {isLeader && (
                            <Badge
                              className="shrink-0 border-transparent"
                              style={{ backgroundColor: color?.darker, color: "#fff" }}
                            >
                              1위
                            </Badge>
                          )}
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-[22px] font-medium tabular-nums",
                            !isLeader && "text-foreground",
                          )}
                          style={isLeader ? { color: color?.darker } : undefined}
                        >
                          {formatPercent(latest.price)}
                        </p>
                      </div>
                    );
                  })}
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
