import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PROBLEM_TYPE_LABELS } from '@/entities/market/lib/marketProblemLabels';
import { useAdminMarketProblemListQuery } from '@/entities/market/model/useAdminMarketProblemListQuery';
import type {
  AdminMarketProblemFilterType,
  AdminMarketProblemItem,
} from '@/entities/market/model/market.types';
import { formatDateTime } from '@/shared/lib/formatDate';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { PageContainer } from '@/shared/ui/page-container';
import { PageHeader } from '@/shared/ui/page-header';
import { Skeleton } from '@/shared/ui/skeleton';

const PROBLEM_TYPE_TABS: { key: AdminMarketProblemFilterType; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'SETTLEMENT', label: '정산' },
  { key: 'REFUND', label: '환불' },
  { key: 'PREDICTION_RECONCILE', label: '예측 정합' },
  { key: 'REPUTATION', label: '평판' },
];

const PAGE_SIZE = 20;

export default function AdminMarketProblemListPage() {
  const [activeType, setActiveType] = useState<AdminMarketProblemFilterType>('ALL');
  const [page, setPage] = useState(0);

  const listQuery = useAdminMarketProblemListQuery({
    type: activeType,
    page,
    size: PAGE_SIZE,
  });

  function handleTabClick(type: AdminMarketProblemFilterType) {
    setActiveType(type);
    setPage(0);
  }

  return (
    <PageContainer>
      <PageHeader
        title="문제 마켓"
        description="자동 복구 중이거나 수동 확인이 필요한 마켓 목록 (조회 전용)"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {PROBLEM_TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                activeType === tab.key
                  ? 'border-foreground/15 bg-card shadow-sm'
                  : 'border-transparent text-muted-foreground hover:bg-muted',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {listQuery.isLoading && <ProblemListSkeleton />}

        {listQuery.isError && (
          <ErrorState
            message="문제 마켓 목록을 불러오는 중 문제가 발생했습니다."
            action={<Button onClick={() => listQuery.refetch()}>다시 시도</Button>}
          />
        )}

        {listQuery.data && listQuery.data.content.length === 0 && (
          <EmptyState
            title="확인이 필요한 문제 마켓이 없습니다"
            description="모든 마켓이 정상적으로 처리되고 있습니다."
          />
        )}

        {listQuery.data && listQuery.data.content.length > 0 && (
          <>
            <div className="space-y-3">
              {listQuery.data.content.map((item) => (
                <ProblemCard key={`${item.marketId}-${item.problemType}`} item={item} />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {listQuery.data.totalElements.toLocaleString()}건 중{' '}
                {page * PAGE_SIZE + 1}-
                {Math.min((page + 1) * PAGE_SIZE, listQuery.data.totalElements)}
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

function ProblemCard({ item }: { item: AdminMarketProblemItem }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const countsLabel = buildCountsLabel(item);

  return (
    <button
      type="button"
      onClick={() => navigate(`/admin/markets/${item.marketId}`)}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted/40',
        item.manualCheckRequired ? 'border-red-300 bg-red-50/40' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {item.title} <span className="text-muted-foreground">#{item.marketId}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {PROBLEM_TYPE_LABELS[item.problemType]}
            {countsLabel && ` · ${countsLabel}`}
            {item.lastAttemptAt && ` · 마지막 시도 ${formatDateTime(item.lastAttemptAt)}`}
          </p>
          {item.lastErrorMessage && (
            <p
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              className={cn('mt-1 text-xs text-muted-foreground', !expanded && 'truncate')}
            >
              {item.lastErrorCode && (
                <span className="font-mono">[{item.lastErrorCode}] </span>
              )}
              {item.lastErrorMessage}
            </p>
          )}
        </div>
        <ProblemBadge item={item} />
      </div>
    </button>
  );
}

function buildCountsLabel(item: AdminMarketProblemItem): string {
  const parts: string[] = [];
  if (item.failedCount > 0) parts.push(`FAILED ${item.failedCount}건`);
  if (item.unknownCount > 0) parts.push(`UNKNOWN ${item.unknownCount}건`);
  if (item.pendingStaleCount > 0) parts.push(`PENDING_STALE ${item.pendingStaleCount}건`);
  return parts.join(' · ');
}

function ProblemBadge({ item }: { item: AdminMarketProblemItem }) {
  if (item.manualCheckRequired) {
    return <Badge variant="danger">수동 확인 필요</Badge>;
  }
  if (item.autoRecoverable) {
    return <Badge variant="info">자동 복구 중</Badge>;
  }
  return <Badge variant="neutral">확인 중</Badge>;
}

function ProblemListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  );
}
