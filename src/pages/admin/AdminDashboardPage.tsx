import { Link } from "react-router-dom";

import { useAdminMarketStatusCountsQuery } from "@/entities/market/model/useAdminMarketStatusCountsQuery";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";

export function AdminDashboardPage() {
  const { data: marketCounts, isLoading, isError, refetch } = useAdminMarketStatusCountsQuery();

  return (
    <PageContainer>
      <PageHeader
        title="관리자 대시보드"
        description="예측 마켓 및 선호 배틀 상품을 개설하고 정산, 중단 등의 작업을 수행합니다."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Market Management */}
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">예측 마켓 관리</CardTitle>
            <CardDescription className="text-xs">현재 생성된 예측 시장 관리 및 신규 시장 생성</CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                render={<Link to={ROUTE_PATH.ADMIN_MARKETS} />}
              >
                목록 보기
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {isError ? (
              <div className="rounded-lg bg-slate-50 p-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">현황을 불러오지 못했습니다</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  재시도
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">진행 중인 마켓</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    <span className="text-slate-900">{marketCounts?.active}개</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">결과 대기 중인 마켓</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    <span className="text-slate-900">{marketCounts?.closedByTime}개</span>
                  )}
                </div>
              </div>
            )}
            <Button
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs"
              render={<Link to={ROUTE_PATH.ADMIN_MARKET_CREATE} />}
            >
              신규 마켓 개설하기
            </Button>
          </CardContent>
        </Card>

        {/* Battle Management */}
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">선호 배틀 관리</CardTitle>
            <CardDescription className="text-xs">입지 대결 커뮤니티 투표 개설 및 조율</CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                render={<Link to={ROUTE_PATH.ADMIN_BATTLES} />}
              >
                목록 보기
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600">
                배틀 검수 대기 및 진행 현황은 목록에서 확인하세요.
              </p>
            </div>
            {/* TODO: 관리자 배틀 개설 화면/라우트가 아직 없음. /battles/new 재사용 여부는 기획 확인 필요 */}
            <Button
              className="w-full rounded-xl bg-slate-900 text-white font-bold py-2.5 text-xs"
              disabled
            >
              신규 배틀 개설하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
