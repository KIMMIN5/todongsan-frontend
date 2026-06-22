import { useState } from "react";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { usePointHistoryQuery } from "@/entities/point/model/point.queries";
import type { PointHistoryFilterType } from "@/entities/point/model/point.types";
import { formatDateTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";

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

      <Tabs value={filter} onValueChange={handleFilterChange}>
        <TabsList>
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl border-slate-200 bg-white">
        <CardContent className="pt-4">
          {historyQuery.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : historyQuery.isError ? (
            <ErrorState />
          ) : !data || data.content.length === 0 ? (
            <EmptyState title="포인트 내역이 없습니다" description="아직 포인트 적립/사용 내역이 없습니다." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>일시</TableHead>
                    <TableHead>사유</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead className="text-right">거래 후 잔액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((item) => {
                    const isPositive = !item.amount.startsWith("-");
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</TableCell>
                        <TableCell className="text-xs text-slate-500">{item.reason ?? "-"}</TableCell>
                        <TableCell
                          className={`text-right text-xs font-bold ${
                            isPositive ? "text-emerald-600" : "text-destructive"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {formatPointAmount(item.amount)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500">
                          {formatPointAmount(item.balanceSnapshot)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  총 {data.totalElements.toLocaleString()}건 · {page + 1} / {Math.max(data.totalPages, 1)} 페이지
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.totalPages === 0 || page + 1 >= data.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    다음
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
