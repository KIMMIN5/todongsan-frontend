import { Link } from "react-router-dom";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { isApiError } from "@/shared/api/apiError";
import { useMarketListQuery } from "@/entities/market/model/useMarketListQuery";
import type { MarketListParams } from "@/entities/market/model/market.types";
import { useBattleListQuery } from "@/entities/battle/model/useBattleListQuery";
import type { BattleSummary, BattleListParams } from "@/entities/battle/model/battle.types";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { SectionTitle } from "@/shared/ui/section-title";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import { PopularMarketCard } from "./ui/PopularMarketCard";

// 인기 마켓: 진행 중(ACTIVE) + 실제 참여 볼륨 내림차순(popular), 메인 노출 6개.
const POPULAR_MARKET_PARAMS: MarketListParams = {
  displayStatus: "ACTIVE",
  sort: "popular",
  page: 0,
  size: 6,
};

// 실시간 뜨거운 배틀: 진행 중(ACTIVE) 투표 수 내림차순 3개
const TRENDING_BATTLE_PARAMS: BattleListParams = {
  status: "ACTIVE",
  sort: "popular",
  page: 0,
  size: 3,
};

export function HomePage() {
  const { data, error, isError, isLoading, refetch } =
    useMarketListQuery(POPULAR_MARKET_PARAMS);

  const {
    data: battleData,
    isError: isBattleError,
    isLoading: isBattleLoading,
    refetch: refetchBattle,
  } = useBattleListQuery(TRENDING_BATTLE_PARAMS);

  const popularErrorMessage = isApiError(error)
    ? error.message
    : error instanceof Error
      ? error.message
      : "인기 마켓을 불러오는 중 문제가 발생했습니다.";

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:px-16 max-w-3xl space-y-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            실시간 부동산 이슈 분석 플랫폼
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
            동네 이슈를 예측하고,<br />
            아파트 선호를 투표해보세요
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
            토동산은 지역 부동산 이슈를 예측 시장과 커뮤니티 투표로 확인하는 서비스입니다.
            포인트로 예측에 참여해 정확도를 시험하고 다른 사용자와 의견을 겨뤄보세요.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={ROUTE_PATH.MARKETS}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none transition-transform active:scale-95 shadow"
              )}
            >
              마켓 둘러보기
            </Link>
            <Link
              to={ROUTE_PATH.BATTLES}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none transition-transform active:scale-95 shadow"
              )}
            >
              배틀 참여하기
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Markets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="인기 예측 마켓"
            description="현재 가장 활발하게 참여가 이루어지고 있는 이슈들입니다."
          />
          <Link
            to={ROUTE_PATH.MARKETS}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        {isLoading && <PopularMarketsSkeleton />}

        {isError && (
          <ErrorState
            message={popularErrorMessage}
            action={<Button onClick={() => refetch()}>다시 시도</Button>}
          />
        )}

        {!isLoading && !isError && data && data.content.length === 0 && (
          <EmptyState
            title="진행 중인 인기 마켓이 없습니다"
            description="새로운 예측 마켓이 열리면 이곳에 표시됩니다."
          />
        )}

        {!isLoading && !isError && data && data.content.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {data.content.map((market) => (
              <PopularMarketCard key={market.marketId} market={market} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Battles Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="실시간 뜨거운 배틀"
            description="더 매력적인 부동산 입지와 주거 조건을 선택해주세요."
          />
          <Link
            to={ROUTE_PATH.BATTLES}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        {isBattleLoading && <TrendingBattlesSkeleton />}

        {isBattleError && (
          <ErrorState
            message="배틀 목록을 불러오는 중 문제가 발생했습니다."
            action={<Button onClick={() => refetchBattle()}>다시 시도</Button>}
          />
        )}

        {!isBattleLoading && !isBattleError && battleData && battleData.content.length === 0 && (
          <EmptyState
            title="진행 중인 배틀이 없습니다"
            description="새로운 배틀이 시작되면 이곳에 표시됩니다."
          />
        )}

        {!isBattleLoading && !isBattleError && battleData && battleData.content.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {battleData.content.map((battle) => (
              <TrendingBattleCard key={battle.battleId} battle={battle} />
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

type TrendingBattleCardProps = {
  battle: BattleSummary;
};

function TrendingBattleCard({ battle }: TrendingBattleCardProps) {
  return (
    <Link to={`/battles/${battle.battleId}`} className="block group">
      <Card className="h-full rounded-2xl border-slate-200 bg-white transition-shadow group-hover:shadow-md flex flex-col justify-between">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-2">
            {battle.title}
          </CardTitle>
          <CardDescription className="text-xs">
            현재 {battle.voteCount.toLocaleString()}명이 투표에 동참했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium bg-white">
              <span className="text-slate-800 font-semibold truncate max-w-[80%]">
                {battle.optionA}
              </span>
              <span className="text-emerald-600 font-bold">A</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium bg-white">
              <span className="text-slate-800 font-semibold truncate max-w-[80%]">
                {battle.optionB}
              </span>
              <span className="text-sky-600 font-bold">B</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            <span>투표 {battle.voteCount.toLocaleString()}</span>
            {battle.commentCount != null && (
              <span>댓글 {battle.commentCount.toLocaleString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TrendingBattlesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <Skeleton className="h-3 w-1/3 mt-2" />
        </div>
      ))}
    </div>
  );
}

function PopularMarketsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="mt-3 h-4 w-11/12" />
          <Skeleton className="mt-2 h-4 w-8/12" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
