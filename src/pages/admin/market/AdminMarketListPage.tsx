import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useMarketListQuery } from "@/entities/market/model/useMarketListQuery";
import { useAdminMarketStatusCountsQuery } from "@/entities/market/model/useAdminMarketStatusCountsQuery";
import type {
  AdminMarketStatusCounts,
  MarketListParams,
  MarketSummary,
} from "@/entities/market/model/market.types";
import { DISPLAY_STATUS_BADGE } from "@/entities/market/lib/marketDisplayStatusBadge";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { formatDate } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";

type AdminMarketTabKey =
  | "ALL"
  | "PENDING"
  | "ACTIVE"
  | "CLOSED_BY_TIME"
  | "CLOSED"
  | "SETTLEMENT_IN_PROGRESS"
  | "SETTLED"
  | "VOIDED"
  | "PROBLEM";

type AdminMarketTab = {
  key: AdminMarketTabKey;
  label: string;
  countKey: keyof AdminMarketStatusCounts;
  params?: MarketListParams;
  highlight?: "warning" | "danger";
};

const ADMIN_MARKET_TABS: AdminMarketTab[] = [
  { key: "ALL", label: "전체", countKey: "total", params: {} },
  { key: "PENDING", label: "대기", countKey: "pending", params: { status: "PENDING" } },
  { key: "ACTIVE", label: "진행 중", countKey: "active", params: { displayStatus: "ACTIVE" } },
  {
    key: "CLOSED_BY_TIME",
    label: "결과 대기",
    countKey: "closedByTime",
    params: { displayStatus: "CLOSED_BY_TIME" },
    highlight: "warning",
  },
  { key: "CLOSED", label: "정산 대기", countKey: "closed", params: { status: "CLOSED" } },
  {
    key: "SETTLEMENT_IN_PROGRESS",
    label: "정산 중",
    countKey: "settlementInProgress",
    params: { status: "SETTLEMENT_IN_PROGRESS" },
  },
  { key: "SETTLED", label: "완료", countKey: "settled", params: { status: "SETTLED" } },
  { key: "VOIDED", label: "무효", countKey: "voided", params: { status: "VOIDED" } },
  { key: "PROBLEM", label: "문제", countKey: "problemMarketCount", highlight: "danger" },
];

const PAGE_SIZE = 20;

export default function AdminMarketListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminMarketTab>(ADMIN_MARKET_TABS[0]);
  const [page, setPage] = useState(0);

  const countsQuery = useAdminMarketStatusCountsQuery();
  const listQuery = useMarketListQuery({
    ...(activeTab.params ?? {}),
    page,
    size: PAGE_SIZE,
  });

  function handleTabClick(tab: AdminMarketTab) {
    if (tab.key === "PROBLEM") {
      navigate("/admin/markets/problems");
      return;
    }
    setActiveTab(tab);
    setPage(0);
  }

  return (
    <PageContainer>
      <PageHeader
        title="마켓 관리"
        description="마켓 생성/활성화/정산 관리"
        actions={
          <Button render={<Link to={ROUTE_PATH.ADMIN_MARKET_CREATE} />} size="sm">
            마켓 생성
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {ADMIN_MARKET_TABS.map((tab) => {
            const count = countsQuery.data?.[tab.countKey] ?? 0;
            const isActive = tab.key !== "PROBLEM" && activeTab.key === tab.key;
            const isHighlighted = tab.highlight && count > 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={cn(
                  "min-w-20 rounded-lg border px-3 py-2 text-left transition-colors",
                  isActive
                    ? "border-foreground/15 bg-card shadow-sm"
                    : "border-transparent hover:bg-muted",
                  isHighlighted &&
                    tab.highlight === "warning" &&
                    "border-amber-300 bg-amber-50",
                  isHighlighted &&
                    tab.highlight === "danger" &&
                    "border-red-300 bg-red-50",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isHighlighted && tab.highlight === "warning" && "text-amber-700",
                    isHighlighted && tab.highlight === "danger" && "text-red-700",
                  )}
                >
                  {tab.label}
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {countsQuery.isLoading ? "-" : count}
                </p>
              </button>
            );
          })}
        </div>

        {listQuery.isLoading && <AdminMarketTableSkeleton />}

        {listQuery.isError && (
          <ErrorState
            message="마켓 목록을 불러오는 중 문제가 발생했습니다."
            action={<Button onClick={() => listQuery.refetch()}>다시 시도</Button>}
          />
        )}

        {listQuery.data && listQuery.data.content.length === 0 && (
          <EmptyState
            title="해당 상태의 마켓이 없습니다"
            description="다른 탭을 선택해보세요."
          />
        )}

        {listQuery.data && listQuery.data.content.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>유동성</TableHead>
                  <TableHead>마감</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.content.map((market) => (
                  <AdminMarketRow key={market.marketId} market={market} />
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {listQuery.data.totalElements.toLocaleString()}건 중{" "}
                {page * PAGE_SIZE + 1}-
                {Math.min(
                  (page + 1) * PAGE_SIZE,
                  listQuery.data.totalElements,
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={listQuery.data.last}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

function AdminMarketRow({ market }: { market: MarketSummary }) {
  const navigate = useNavigate();
  const badge = DISPLAY_STATUS_BADGE[market.displayStatus];
  const isResultPending = market.displayStatus === "CLOSED_BY_TIME";
  const isSettlementPending = market.displayStatus === "CLOSED";
  const isSettled = market.displayStatus === "SETTLED";
  const liquidity = market.totalRealPoolAmount ?? market.totalPoolAmount;

  return (
    <TableRow
      className={cn(isResultPending && "bg-amber-50 hover:bg-amber-50/80")}
    >
      <TableCell className="text-muted-foreground">{market.marketId}</TableCell>
      <TableCell className="max-w-64 truncate font-medium text-foreground">
        {market.title}
      </TableCell>
      <TableCell>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </TableCell>
      <TableCell className="tabular-nums">
        {formatPointAmount(liquidity)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(market.closeAt)}
      </TableCell>
      <TableCell className="text-right">
        {isResultPending && (
          <Button
            size="sm"
            className="bg-amber-600 text-white hover:bg-amber-700"
            onClick={() => navigate(`/admin/markets/${market.marketId}/result`)}
          >
            결과 확정
          </Button>
        )}
        {isSettlementPending && (
          <Button
            size="sm"
            onClick={() => navigate(`/admin/markets/${market.marketId}`)}
          >
            정산 실행
          </Button>
        )}
        {!isResultPending && !isSettlementPending && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/markets/${market.marketId}`)}
          >
            {isSettled ? "정산 내역" : "상세"}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function AdminMarketTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
