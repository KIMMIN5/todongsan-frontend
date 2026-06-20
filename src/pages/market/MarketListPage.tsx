import { MarketCard } from "@/entities/market/ui/MarketCard";
import { useMarketListQuery } from "@/entities/market/model/useMarketListQuery";
import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

const marketListParams = {
  page: 0,
  size: 20,
};

export function MarketListPage() {
  const { data, error, isError, isLoading, refetch } =
    useMarketListQuery(marketListParams);

  return (
    <PageContainer>
      <PageHeader
        title="예측 마켓"
        description="다양한 부동산 관련 지표와 가격을 예측하고 포인트로 참여해보세요."
      />

      {isLoading && <MarketListSkeleton />}

      {isError && (
        <ErrorState
          message={
            isApiError(error)
              ? error.message
              : error instanceof Error
              ? error.message
              : "마켓 목록을 불러오는 중 문제가 발생했습니다."
          }
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title="등록된 마켓이 없습니다"
          description="새로운 예측 마켓이 열리면 이곳에 표시됩니다."
        />
      )}

      {data && data.content.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {data.content.map((market) => (
            <MarketCard key={market.marketId} market={market} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function MarketListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="mt-3 h-4 w-11/12" />
          <Skeleton className="mt-2 h-4 w-8/12" />
          <div className="mt-5 space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
