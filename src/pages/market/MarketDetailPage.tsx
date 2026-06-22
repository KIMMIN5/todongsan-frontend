import { Link, useParams } from "react-router-dom";

import { useAuthStore } from "@/entities/auth/model/auth.store";
import { useMarketDetailQuery } from "@/entities/market/model/useMarketDetailQuery";
import type {
  MarketDisplayStatus,
  MarketStatus,
} from "@/entities/market/model/market.types";
import { getOptionColorMap } from "@/entities/market/lib/optionColor";
import { MarketOptionList } from "@/entities/market/ui/MarketOptionList";
import { MarketPriceHistorySection } from "@/entities/market/ui/MarketPriceHistorySection";
import { CreateMarketPredictionPanel } from "@/features/market-prediction/create/ui/CreateMarketPredictionPanel";
import { MarketStatusBadge } from "@/entities/market/ui/MarketStatusBadge";
import { useMyMarketPredictionQuery } from "@/entities/prediction/model/useMyMarketPredictionQuery";
import { MyMarketPredictionCard } from "@/entities/prediction/ui/MyMarketPredictionCard";
import { isApiError } from "@/shared/api/apiError";
import { formatDateTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
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
          {/* 상단 헤더: 상태 뱃지 + 제목 + 메타(마감/결과 발표/유동성) */}
          <header className="space-y-2 border-b border-border pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <MarketStatusBadge displayStatus={data.displayStatus} />
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              {data.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              마감 {formatDateTime(data.closeAt)}
              {data.resultAnnounceAt
                ? ` · 결과 발표 ${formatDateTime(data.resultAnnounceAt)}`
                : ""}{" "}
              · 유동성{" "}
              {formatPointAmount(data.totalRealPoolAmount ?? data.totalPoolAmount)}
            </p>
          </header>

          {/* 2단 레이아웃: 좌측 메인(1.6fr) + 우측 거래 패널(1fr, sticky) */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-6">
              <Card>
                <CardHeader>
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

              <MarketPriceHistorySection
                marketId={data.marketId}
                options={data.options}
              />

              <MyPredictionSection
                marketId={data.marketId}
                options={data.options}
                marketStatus={data.status}
                marketDisplayStatus={data.displayStatus}
                enabled={isAuthenticated || hasDevMemberId()}
              />

              {isReportAvailable(data.displayStatus) && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI 리포트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                      AI가 이 마켓의 결과를 분석한 리포트를 확인하세요.
                    </p>
                    <Button
                      className="w-full"
                      render={<Link to={`/markets/${data.marketId}/report`} />}
                    >
                      AI 리포트 보기
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <aside className="lg:sticky lg:top-20">
              <CreateMarketPredictionPanel
                marketId={data.marketId}
                options={data.options}
                canPredict={data.canPredict}
                displayStatus={data.displayStatus}
              />
            </aside>
          </div>
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
  marketStatus: MarketStatus;
  marketDisplayStatus: MarketDisplayStatus;
  enabled: boolean;
};

function MyPredictionSection({
  marketId,
  options,
  marketStatus,
  marketDisplayStatus,
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

  const optionColor = getOptionColorMap(options.map((option) => option.optionId))[
    data.selectedOptionId
  ];

  return (
    <MyMarketPredictionCard
      prediction={data}
      selectedOptionLabel={selectedOptionLabel}
      marketStatus={marketStatus}
      marketDisplayStatus={marketDisplayStatus}
      optionColor={optionColor}
    />
  );
}

function hasDevMemberId() {
  return Boolean(import.meta.env.DEV && import.meta.env.VITE_DEV_MEMBER_ID);
}

function isReportAvailable(displayStatus: MarketDisplayStatus): boolean {
  return (
    displayStatus === "CLOSED_BY_TIME" ||
    displayStatus === "DATA_PENDING" ||
    displayStatus === "CLOSED" ||
    displayStatus === "SETTLEMENT_IN_PROGRESS" ||
    displayStatus === "SETTLED"
  );
}

function MarketDetailSkeleton() {
  return (
    <>
      <div className="space-y-3 border-b border-border pb-5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <Skeleton className="h-6 w-24" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="mt-5 h-40 w-full" />
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-6 w-24" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

export { MarketDetailPage as Component };
