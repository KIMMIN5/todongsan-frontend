import { useSearchParams } from "react-router-dom";

import { BattleCard } from "@/entities/battle/ui/BattleCard";
import { useBattleListQuery } from "@/entities/battle/model/useBattleListQuery";
import type { BattleListStatus } from "@/entities/battle/model/battle.types";
import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const STATUS_TABS: { value: BattleListStatus; label: string }[] = [
  { value: "ACTIVE", label: "진행 중" },
  { value: "CLOSED", label: "종료" },
];

const PAGE_SIZE = 20;

function parseStatus(value: string | null): BattleListStatus {
  return value === "CLOSED" ? "CLOSED" : "ACTIVE";
}

export function BattleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatus(searchParams.get("status"));

  const { data, error, isError, isLoading, refetch } = useBattleListQuery({
    status,
    page: 0,
    size: PAGE_SIZE,
  });

  const handleSelectStatus = (next: BattleListStatus) => {
    setSearchParams(
      next === "ACTIVE" ? {} : { status: next },
      { replace: true },
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="선호 배틀"
        description="지역, 아파트 단지, 주거 인프라 입지 대결에 투표하고 의견을 나누어 보세요."
      />

      {/* 상태 탭 */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleSelectStatus(tab.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <BattleListSkeleton />}

      {isError && (
        <ErrorState
          message={
            isApiError(error)
              ? error.message
              : error instanceof Error
                ? error.message
                : "배틀 목록을 불러오는 중 문제가 발생했습니다."
          }
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title={
            status === "ACTIVE"
              ? "진행 중인 배틀이 없습니다"
              : "종료된 배틀이 없습니다"
          }
          description="새로운 배틀이 열리면 이곳에 표시됩니다."
        />
      )}

      {data && data.content.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.content.map((battle) => (
            <BattleCard key={battle.battleId} battle={battle} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function BattleListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-5 w-11/12" />
          <Skeleton className="mt-2 h-5 w-8/12" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
