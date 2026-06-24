import { Link } from "react-router-dom";
import { BarChart2, Map, TrendingUp } from "lucide-react";

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

const MARKET_STATUS_CONFIG = [
  { key: "pending",              label: "승인 대기"       },
  { key: "active",               label: "진행 중"         },
  { key: "closedByTime",         label: "시간 마감"       },
  { key: "closed",               label: "마감됨"          },
  { key: "dataPending",          label: "데이터 수집 대기" },
  { key: "settlementInProgress", label: "정산 진행 중"    },
  { key: "settled",              label: "정산 완료"       },
  { key: "voided",               label: "무효 처리"       },
] as const;

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
            ) : isLoading ? (
              <div className="rounded-lg bg-slate-50 p-4 space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20 shrink-0" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-3 w-6 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                const rows = MARKET_STATUS_CONFIG.filter(
                  ({ key }) => (marketCounts?.[key] ?? 0) > 0
                );
                const maxCount = rows.length > 0
                  ? Math.max(...rows.map(({ key }) => marketCounts![key]))
                  : 0;
                return (
                  <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                    {rows.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">마켓이 없습니다</p>
                    ) : (
                      rows.map(({ key, label }) => {
                        const count = marketCounts![key];
                        const pct = Math.round((count / maxCount) * 100);
                        const isMax = count === maxCount;
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="w-32 shrink-0 text-xs text-slate-600 font-medium truncate">{label}</span>
                            <div className="flex-1 bg-slate-100 rounded h-3 overflow-hidden">
                              <div
                                className={`${isMax ? "bg-slate-800" : "bg-slate-300"} h-full rounded transition-all duration-300`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 shrink-0 text-xs text-right font-semibold text-slate-700">{count}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })()
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

      {/* Insights */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">플랫폼 인사이트</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              to: ROUTE_PATH.ADMIN_INSIGHTS_OVERVIEW,
              icon: <BarChart2 className="w-4 h-4" />,
              label: "플랫폼 개요",
              desc: "전체 KPI, 평판 분포, AI 리포트 통계",
            },
            {
              to: ROUTE_PATH.ADMIN_INSIGHTS_REGION_MAP,
              icon: <Map className="w-4 h-4" />,
              label: "지역 가격 지도",
              desc: "시도별 가격 지수 Choropleth",
            },
            {
              to: ROUTE_PATH.ADMIN_INSIGHTS_ACTIVITY,
              icon: <TrendingUp className="w-4 h-4" />,
              label: "활동 트렌드",
              desc: "주간 방문 인증·AI리포트·예측결과",
            },
          ].map(({ to, icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
            >
              <span className="mt-0.5 text-slate-500">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
