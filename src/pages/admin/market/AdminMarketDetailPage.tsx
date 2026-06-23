import { useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminMarketInsightPriceHistoryQuery } from "@/entities/insight/model/useAdminMarketInsightPriceHistoryQuery";
import type {
  AdminMarketInsightPriceHistory,
  MarketPredictionDistributionItem,
  MarketPriceDataType,
} from "@/entities/insight/model/insight.types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { AdminMarketManagementView } from "./AdminMarketManagementView";

const DATA_TYPE_LABEL: Record<MarketPriceDataType, string> = {
  WEEKLY_PRICE_INDEX: "주간",
  MONTHLY_PRICE_INDEX: "월간",
};

export default function AdminMarketDetailPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const numericMarketId = Number(marketId);

  return (
    <PageContainer>
      <PageHeader title="마켓 관리 상세" description={`마켓 ID: ${marketId}`} />

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">운영</TabsTrigger>
          <TabsTrigger value="analysis">분석</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <AdminMarketManagementView marketId={numericMarketId} />
        </TabsContent>

        <TabsContent value="analysis">
          <MarketAnalysisTab marketId={numericMarketId} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function MarketAnalysisTab({ marketId }: { marketId: number }) {
  const { data, isLoading, isError, refetch } =
    useAdminMarketInsightPriceHistoryQuery(marketId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="분석 데이터를 불러오는 중 문제가 발생했습니다."
        action={<Button onClick={() => refetch()}>다시 시도</Button>}
      />
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <PriceHistoryCard insight={data} />
      {data.latestPredictionDistribution.length > 0 && (
        <PredictionDistributionCard
          items={data.latestPredictionDistribution}
        />
      )}
    </div>
  );
}

function PriceHistoryCard({ insight }: { insight: AdminMarketInsightPriceHistory }) {
  const region =
    [insight.regionSido, insight.regionSigu].filter(Boolean).join(" ") || "전국";
  const dataTypeLabel = DATA_TYPE_LABEL[insight.dataType];

  return (
    <Card>
      <CardHeader>
        <CardTitle>실거래가 지수</CardTitle>
        <CardDescription>
          {region} · {dataTypeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insight.priceHistory.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            데이터 없음
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={insight.priceHistory}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#94a3b8"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="referenceDate"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => v.toFixed(1)}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(1), "지수"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function PredictionDistributionCard({
  items,
}: {
  items: MarketPredictionDistributionItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>예측 분포</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => {
          const pct = Math.round(item.ratio * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    item.isResult
                      ? "flex items-center gap-1.5 font-bold text-foreground"
                      : "font-medium text-muted-foreground"
                  }
                >
                  {item.optionLabel}
                  {item.isResult && (
                    <Badge variant="success">정답</Badge>
                  )}
                </span>
                <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={
                    item.isResult
                      ? "h-full rounded-full bg-blue-500"
                      : "h-full rounded-full bg-slate-300"
                  }
                  style={{ width: `${(item.ratio * 100).toFixed(2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
