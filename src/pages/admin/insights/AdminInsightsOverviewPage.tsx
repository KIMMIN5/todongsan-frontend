import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useAdminInsightsOverviewQuery } from "@/entities/insight/model/useAdminInsightsOverviewQuery";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

const REPUTATION_COLORS = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export default function AdminInsightsOverviewPage() {
  const { data, isLoading, isError, refetch } = useAdminInsightsOverviewQuery();

  const reputationChartData = data
    ? Object.entries(data.reputationDistribution).map(([grade, ratio]) => ({
        grade,
        ratio,
        pct: Math.round(ratio * 100),
      }))
    : [];

  return (
    <PageContainer>
      <PageHeader
        title="플랫폼 인사이트 개요"
        description="전체 KPI, 평판 분포, AI 리포트 통계"
      />

      <div className="flex justify-end gap-2 mb-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link to={ROUTE_PATH.ADMIN_INSIGHTS_ACTIVITY} />}>
          활동 트렌드
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link to={ROUTE_PATH.ADMIN_INSIGHTS_REGION_MAP} />}>
          지역 가격 지도
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {isError && (
        <ErrorState
          message="인사이트 개요를 불러오지 못했습니다."
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && (
        <div className="space-y-6">
          {/* 플랫폼 지표 카드 */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">플랫폼 지표</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "평판 보유 회원", value: data.platformStats.totalMembersWithReputation.toLocaleString() },
                { label: "평균 평판 점수", value: data.platformStats.avgReputationScore.toFixed(1) },
                { label: "평균 예측 정확도", value: `${data.platformStats.avgPredictionAccuracy.toFixed(1)}%` },
                { label: "방문 인증 수", value: data.platformStats.totalVisitCertifications.toLocaleString() },
                { label: "진행 중 마켓", value: data.platformStats.activeMarketsCount?.toLocaleString() ?? "—" },
                { label: "진행 중 배틀", value: data.platformStats.activeBattlesCount?.toLocaleString() ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 군중 지능 점수 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">군중 지능 점수 (플랫폼 예측 정확도)</p>
              <p className="text-xs text-slate-400 mt-0.5">정산된 마켓에서 정답 예측 비율 × 100</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{data.crowdIntelligenceScore.toFixed(1)}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 평판 분포 도넛차트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">평판 점수 구간 분포</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                {reputationChartData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8">데이터 없음</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={reputationChartData}
                          dataKey="ratio"
                          nameKey="grade"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {reputationChartData.map((_, i) => (
                            <Cell key={i} fill={REPUTATION_COLORS[i % REPUTATION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-2">
                      {reputationChartData.map((r, i) => (
                        <span key={r.grade} className="flex items-center gap-1 text-xs text-slate-600">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: REPUTATION_COLORS[i % REPUTATION_COLORS.length] }}
                          />
                          {r.grade}점 ({r.pct}%)
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI 리포트 통계 + 방문인증 방법 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI 리포트 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <StatRow label="생성 완료" value={data.aiReportStats.totalDone.toLocaleString()} />
                    <StatRow label="생성 실패" value={data.aiReportStats.totalFailed.toLocaleString()} />
                    <StatRow label="처리 대기" value={data.aiReportStats.totalPending.toLocaleString()} />
                  </div>
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">성공률</p>
                    <p className="text-3xl font-bold text-slate-800">
                      {Math.round(data.aiReportStats.successRate * 100)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">방문 인증 방법 비율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(data.visitCertMethodRatio).map(([method, ratio]) => (
                      <div key={method} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-xs text-slate-600 font-medium">{method}</span>
                        <div className="flex-1 bg-slate-100 rounded h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded bg-slate-700"
                            style={{ width: `${Math.round(ratio * 100)}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">
                          {Math.round(ratio * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
