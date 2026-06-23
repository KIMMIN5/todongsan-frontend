import { useState } from "react";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";

import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { usePointBalanceQuery, usePointHistoryQuery } from "@/entities/point/model/point.queries";
import type { PointHistoryFilterType } from "@/entities/point/model/point.types";
import { isIncreaseType } from "@/entities/point/lib/pointTransactionDirection";
import { formatKoreanMonthDay, formatTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 10;

const FILTER_TABS: { value: PointHistoryFilterType | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "EARN", label: "적립" },
  { value: "SPEND", label: "사용" },
  { value: "SETTLE", label: "정산" },
  { value: "REFUND", label: "환불" },
];

export default function PointHistoryPage() {
  const [filter, setFilter] = useState<PointHistoryFilterType | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const balanceQuery = usePointBalanceQuery();
  const historyQuery = usePointHistoryQuery({
    page,
    size: PAGE_SIZE,
    type: filter === "ALL" ? undefined : filter,
  });

  const handleFilterChange = (value: string) => {
    setFilter(value as PointHistoryFilterType | "ALL");
    setPage(0);
  };

  const data = historyQuery.data;

  return (
    <PageContainer>
      <PageHeader title="포인트 내역" description="포인트 적립, 사용, 정산, 환불 내역을 확인하세요." />

      <Card className="relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/10">
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-emerald-400/30 blur-3xl" />
        <CardContent className="relative flex items-center gap-4 py-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <Wallet className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider text-emerald-50/70 uppercase">
              현재 보유 포인트
            </p>
            {balanceQuery.isPending ? (
              <Skeleton className="mt-1.5 h-9 w-32 bg-white/20" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {formatPointAmount(balanceQuery.data?.pointBalance)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={handleFilterChange}>
        <TabsList variant="line">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-2">
          {historyQuery.isPending ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-14 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                    <Skeleton className="ml-auto h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : historyQuery.isError ? (
            <ErrorState />
          ) : !data || data.content.length === 0 ? (
            <EmptyState title="포인트 내역이 없습니다" description="아직 포인트 적립/사용 내역이 없습니다." />
          ) : (
            <>
              <div className="space-y-1">
                {data.content.map((item, index) => {
                  const isIncrease = isIncreaseType(item.type);

                  return (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 40}ms` }}
                      className="group flex animate-in items-center justify-between gap-4 rounded-xl border border-transparent p-3 fade-in-0 slide-in-from-bottom-2 duration-300 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-center text-xs font-semibold text-slate-500">
                          {formatKoreanMonthDay(item.createdAt)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.reason ?? "-"}
                          </p>
                          <p className="text-xs text-slate-400">{formatTime(item.createdAt)}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            isIncrease ? "text-emerald-600" : "text-rose-600",
                          )}
                        >
                          {isIncrease ? "+" : "-"}
                          {formatPointAmount(item.amount)}
                        </p>
                        <p className="text-xs tabular-nums text-slate-400">
                          잔액 {formatPointAmount(item.balanceSnapshot)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">총 {data.totalElements.toLocaleString()}건</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full"
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    aria-label="이전 페이지"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="min-w-10 text-center text-xs font-medium text-slate-600">
                    {page + 1} / {Math.max(data.totalPages, 1)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full"
                    disabled={data.totalPages === 0 || page + 1 >= data.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    aria-label="다음 페이지"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
