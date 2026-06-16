import { useParams } from "react-router-dom";

import { useAuthStore } from "@/entities/auth/model/auth.store";
import { useMarketDetailQuery } from "@/entities/market/model/useMarketDetailQuery";
import { MarketOptionList } from "@/entities/market/ui/MarketOptionList";
import { MarketPriceHistorySection } from "@/entities/market/ui/MarketPriceHistorySection";
import { CreateMarketPredictionPanel } from "@/features/market-prediction/create/ui/CreateMarketPredictionPanel";
import { MarketSettlementRuleCard } from "@/entities/market/ui/MarketSettlementRuleCard";
import { MarketStatusBadge } from "@/entities/market/ui/MarketStatusBadge";
import { useMyMarketPredictionQuery } from "@/entities/prediction/model/useMyMarketPredictionQuery";
import { MyMarketPredictionCard } from "@/entities/prediction/ui/MyMarketPredictionCard";
import { isApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export default function MarketDetailPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isValidMarketId = marketId !== undefined && /^\d+$/.test(marketId);
  const parsedMarketId = isValidMarketId ? Number(marketId) : 0;
  const { data, error, isError, isLoading, refetch } =
    useMarketDetailQuery(parsedMarketId);

  if (!isValidMarketId) {
    return (
      <PageContainer>
        <PageHeader title="마켓 상세" description="마켓 정보를 확인합니다." />
        <ErrorState
          title="잘못된 마켓 주소입니다"
          message="마켓 ID를 확인한 뒤 다시 시도해 주세요."
        />
      </PageContainer>
    );
  }

  const errorMessage = isApiError(error)
    ? error.message
    : error instanceof Error
    ? error.message
    : "마켓 상세 정보를 불러오는 중 문제가 발생했습니다.";

  return (
    <PageContainer>
      {isLoading && <MarketDetailSkeleton />}

      {isError && (
        <>
          <PageHeader title="마켓 상세" description={`마켓 ID: ${marketId}`} />
          <ErrorState
            message={errorMessage}
            action={<Button onClick={() => refetch()}>다시 시도</Button>}
          />
        </>
      )}

      {!isLoading && !isError && !data && (
        <>
          <PageHeader title="마켓 상세" description={`마켓 ID: ${marketId}`} />
          <EmptyState
            title="마켓 정보를 찾을 수 없습니다"
            description="요청한 마켓이 존재하지 않거나 조회할 수 없습니다."
          />
        </>
      )}

      {data && (
        <>
          <PageHeader
            title={data.title}
            description={data.description ?? `마켓 ID: ${data.marketId}`}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{data.marketId}
                  </span>
                  <MarketStatusBadge displayStatus={data.displayStatus} />
                </div>
                <CardTitle>선택지</CardTitle>
              </CardHeader>
              <CardContent>
                {data.options.length > 0 ? (
                  <MarketOptionList options={data.options} />
                ) : (
                  <EmptyState
                    title="등록된 선택지가 없습니다"
                    description="이 마켓에 표시할 선택지 정보가 없습니다."
                  />
                )}
              </CardContent>
            </Card>

            <MarketSettlementRuleCard market={data} />
          </div>

          <CreateMarketPredictionPanel
            marketId={data.marketId}
            options={data.options}
            canPredict={data.canPredict}
            displayStatus={data.displayStatus}
          />

          <MyPredictionSection
            marketId={data.marketId}
            options={data.options}
            enabled={isAuthenticated || hasDevMemberId()}
          />

          <MarketPriceHistorySection
            marketId={data.marketId}
            options={data.options}
          />
        </>
      )}
    </PageContainer>
  );
}

type MyPredictionSectionProps = {
  marketId: number;
  options: {
    optionId: number;
    content: string;
  }[];
  enabled: boolean;
};

function MyPredictionSection({
  marketId,
  options,
  enabled,
}: MyPredictionSectionProps) {
  const { data, error, isError, isLoading, refetch } =
    useMyMarketPredictionQuery(marketId, { enabled });

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내 예측 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="로그인하면 내 예측 상태를 확인할 수 있습니다"
            description="로그인하거나 로컬 개발용 회원 ID를 설정한 뒤 다시 확인해 주세요."
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내 예측 상태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    const errorMessage = isApiError(error)
      ? error.message
      : error instanceof Error
      ? error.message
      : "내 예측 상태를 불러오는 중 문제가 발생했습니다.";

    return (
      <Card>
        <CardHeader>
          <CardTitle>내 예측 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message={errorMessage}
            action={<Button onClick={() => refetch()}>다시 시도</Button>}
          />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내 예측 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="아직 이 마켓에 참여하지 않았습니다"
            description="예측에 참여하면 이곳에서 내 예측 상태를 확인할 수 있습니다."
          />
        </CardContent>
      </Card>
    );
  }

  const selectedOptionLabel = options.find(
    (option) => option.optionId === data.selectedOptionId,
  )?.content;

  return (
    <MyMarketPredictionCard
      prediction={data}
      selectedOptionLabel={selectedOptionLabel}
    />
  );
}

function hasDevMemberId() {
  return Boolean(import.meta.env.DEV && import.meta.env.VITE_DEV_MEMBER_ID);
}

function MarketDetailSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-6 w-24" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-6 w-24" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        </div>
      </div>
    </>
  );
}

export { MarketDetailPage as Component };
