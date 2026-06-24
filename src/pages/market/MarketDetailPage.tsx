import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuthStore } from "@/entities/auth/model/auth.store";
import { useMarketPublicDataReferenceQuery } from "@/entities/insight/model/useMarketPublicDataReferenceQuery";
import type { MarketPublicDataReferenceResponse } from "@/entities/insight/model/insight.types";
import { useMarketDetailQuery } from "@/entities/market/model/useMarketDetailQuery";
import { useMarketCommentListQuery } from "@/entities/market/model/useMarketCommentListQuery";
import type {
  MarketComment,
  MarketDisplayStatus,
  MarketStatus,
} from "@/entities/market/model/market.types";
import { getOptionColorMap } from "@/entities/market/lib/optionColor";
import { MarketOptionList } from "@/entities/market/ui/MarketOptionList";
import { MarketCommentList } from "@/entities/market/ui/MarketCommentList";
import { MarketCommentPagination } from "@/entities/market/ui/MarketCommentPagination";
import { MarketPriceHistorySection } from "@/entities/market/ui/MarketPriceHistorySection";
import { CreateMarketPredictionPanel } from "@/features/market-prediction/create/ui/CreateMarketPredictionPanel";
import { MarketCommentForm } from "@/features/create-market-comment/ui/MarketCommentForm";
import { DeleteMarketCommentButton } from "@/features/delete-market-comment/ui/DeleteMarketCommentButton";
import { MarketStatusBadge } from "@/entities/market/ui/MarketStatusBadge";
import { useMyMarketPredictionQuery } from "@/entities/prediction/model/useMyMarketPredictionQuery";
import { MyMarketPredictionCard } from "@/entities/prediction/ui/MyMarketPredictionCard";
import { isApiError } from "@/shared/api/apiError";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { formatDate, formatDateTime } from "@/shared/lib/formatDate";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { MarkdownContent } from "@/shared/ui/markdown-content";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export default function MarketDetailPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentMemberId = useAuthStore((state) => state.memberId);
  const currentNickname = useAuthStore((state) => state.nickname);
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

              {data.displayStatus === "ACTIVE" && (
                <PublicDataReferenceSection marketId={data.marketId} />
              )}

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

              <MarketCommentSection
                marketId={data.marketId}
                marketStatus={data.status}
                isAuthenticated={isAuthenticated}
                currentMemberId={currentMemberId}
                currentNickname={currentNickname}
              />
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

const COMMENT_PAGE_SIZE = 10;

type MarketCommentSectionProps = {
  marketId: number;
  marketStatus: MarketStatus;
  isAuthenticated: boolean;
  currentMemberId: number | null;
  currentNickname: string | null;
};

function MarketCommentSection({
  marketId,
  marketStatus,
  isAuthenticated,
  currentMemberId,
  currentNickname,
}: MarketCommentSectionProps) {
  const [page, setPage] = useState(0);

  const { data, error, isError, isLoading, isFetching, refetch } =
    useMarketCommentListQuery(marketId, { page, size: COMMENT_PAGE_SIZE });

  function handleCommentDeleted() {
    // 마지막 남은 댓글을 지운 page라면 이전 page로 이동해 빈 화면을 피한다.
    if (data && data.content.length === 1 && page > 0) {
      setPage((prev) => prev - 1);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>댓글</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <MarketCommentForm
          marketId={marketId}
          marketStatus={marketStatus}
          isAuthenticated={isAuthenticated}
          unauthenticatedFallback={<CommentLoginRequired />}
        />

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            title="댓글을 불러오지 못했습니다"
            message={
              isApiError(error)
                ? error.message
                : "댓글을 불러오는 중 문제가 발생했습니다."
            }
            action={<Button onClick={() => refetch()}>다시 시도</Button>}
          />
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="아직 댓글이 없습니다"
            description="가장 먼저 의견을 남겨보세요."
          />
        )}

        {data && data.content.length > 0 && (
          <>
            <MarketCommentList
              comments={data.content}
              currentMemberId={currentMemberId}
              currentNickname={currentNickname}
              renderDeleteSlot={(comment: MarketComment) => (
                <DeleteMarketCommentButton
                  marketId={marketId}
                  commentId={comment.commentId}
                  onDeleted={handleCommentDeleted}
                />
              )}
            />

            <MarketCommentPagination
              page={page}
              totalPages={data.totalPages}
              isFetching={isFetching}
              onPrev={() => setPage((prev) => Math.max(prev - 1, 0))}
              onNext={() => setPage((prev) => prev + 1)}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CommentLoginRequired() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">
        댓글을 작성하려면 로그인이 필요합니다.
      </p>
      <Button render={<Link to={ROUTE_PATH.LOGIN} />} variant="outline" size="sm">
        로그인하기
      </Button>
    </div>
  );
}

function hasDevMemberId() {
  return Boolean(import.meta.env.DEV && import.meta.env.VITE_DEV_MEMBER_ID);
}

function PublicDataReferenceSection({ marketId }: { marketId: number }) {
  const { data, isLoading, isError, refetch } =
    useMarketPublicDataReferenceQuery(marketId);

  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white">
      <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
          AI
        </span>
        <div>
          <p className="text-sm font-semibold text-blue-900">AI 시장 참고 정보</p>
          <p className="text-[11px] text-blue-500">
            공공 데이터 기반 분석 · 투자 조언이 아닙니다
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              AI가 공공 데이터를 분석하고 있습니다. 최대 1분 소요될 수 있습니다.
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {isError && (
          <ErrorState
            message="참고 정보를 불러오는 중 문제가 발생했습니다."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        )}

        {data && <PublicDataReferenceContent data={data} />}
      </div>
    </div>
  );
}

function PublicDataReferenceContent({
  data,
}: {
  data: MarketPublicDataReferenceResponse;
}) {
  if (!data.aiAnalyzed && data.dataAsOf === null) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        이 마켓의 공공 데이터가 아직 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* 제목 + 기준일 */}
      <div className="flex flex-col gap-1.5">
        <p className="min-w-0 break-keep text-sm font-semibold text-slate-800 leading-snug">
          {data.title}
        </p>
        {data.dataAsOf && (
          <span className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-600">
            {formatDate(data.dataAsOf)} 기준
          </span>
        )}
      </div>

      {!data.aiAnalyzed && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          AI 분석을 일시적으로 이용할 수 없습니다. 공공 데이터 원문을 직접
          참고해 주세요.
        </div>
      )}

      {data.aiAnalyzed && (
        <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3">
          <p className="mb-1 text-xs font-semibold text-blue-600">AI 요약</p>
          <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
        </div>
      )}

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600">
          <svg
            className="h-3.5 w-3.5 transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          상세 데이터 보기
        </summary>
        <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-slate-100">
          <MarkdownContent content={data.content} />
        </div>
      </details>
    </div>
  );
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
