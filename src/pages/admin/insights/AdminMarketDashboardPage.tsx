import { useParams } from "react-router-dom";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminMarketDashboardQuery } from "@/entities/insight/model/useAdminMarketDashboardQuery";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

const CHART_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const DIRECTION_LABEL: Record<string, string> = {
  RISING: "상승 ▲",
  FALLING: "하락 ▼",
  FLAT: "보합 —",
};

export default function AdminMarketDashboardPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const isValidId = marketId !== undefined && /^\d+$/.test(marketId);
  const parsedId = isValidId ? Number(marketId) : 0;

  const { data, isLoading, isError, refetch } = useAdminMarketDashboardQuery(parsedId);

  if (!isValidId) {
    return (
      <PageContainer>
        <PageHeader title="마켓 대시보드" />
        <ErrorState title="잘못된 마켓 주소입니다" message="마켓 ID를 확인해 주세요." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={data ? `마켓 대시보드 — ${data.title}` : `마켓 대시보드 #${marketId}`}
        description={data?.regionSido ? `${data.regionSido} ${data.regionSigu ?? ""}`.trim() : undefined}
      />

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      )}

      {isError && (
        <ErrorState
          message="마켓 대시보드를 불러오지 못했습니다."
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && (
        <div className="space-y-6">
          {/* 수치 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">방문 인증 수</p>
              <p className="text-2xl font-bold text-slate-800">{data.visitCertStats.certifiedVisitorCount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-1">GPS {data.visitCertStats.gpsCertCount} / 댓글 {data.visitCertStats.commentCertCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">참여자 수</p>
              <p className="text-2xl font-bold text-slate-800">
                {data.participantStats?.totalParticipants.toLocaleString() ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">가격 추세</p>
              <p className="text-2xl font-bold text-slate-800">
                {DIRECTION_LABEL[data.priceHistory.trendDirection] ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">기간 변동률</p>
              <p className="text-2xl font-bold text-slate-800">
                {data.priceHistory.changeRate !== null
                  ? `${data.priceHistory.changeRate > 0 ? "+" : ""}${data.priceHistory.changeRate.toFixed(2)}%`
                  : "—"}
              </p>
            </div>
          </div>

          {/* 가격 이력 라인차트 */}
          {data.priceHistory.records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">가격 이력 ({data.priceHistory.dataType})</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.priceHistory.records}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="referenceDate" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" name="가격지수" stroke="#2563eb" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 가격 vs 예측 오버레이 */}
          {data.priceVsPredictionOverlay && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">가격 vs 예측 대조</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                    <p className="text-xs text-slate-500">가격 추세 방향</p>
                    <p className="font-semibold text-slate-800">{DIRECTION_LABEL[data.priceVsPredictionOverlay.priceTrendDirection]}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                    <p className="text-xs text-slate-500">군중 예측 정확도</p>
                    <p className={`font-semibold ${data.priceVsPredictionOverlay.crowdPredictedCorrectly ? "text-emerald-600" : "text-red-500"}`}>
                      {data.priceVsPredictionOverlay.crowdPredictedCorrectly ? "✓ 정확" : "✗ 부정확"}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-lg bg-slate-50 p-3 space-y-1">
                    <p className="text-xs text-slate-500">다수 선택 옵션</p>
                    <p className="font-semibold text-slate-800">{data.priceVsPredictionOverlay.majorityOption}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* 예측 분포 도넛차트 */}
            {data.predictionDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">예측 분포</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.predictionDistribution}
                        dataKey="ratio"
                        nameKey="optionLabel"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {data.predictionDistribution.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.predictionDistribution.map((item, i) => (
                      <span key={item.optionLabel} className="flex items-center gap-1 text-xs text-slate-600">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {item.optionLabel} {Math.round(item.ratio * 100)}%
                        {item.isResult && <span className="text-emerald-600 font-semibold">(결과)</span>}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 참여자 인구통계 */}
            {data.participantStats ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">참여자 인구통계</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 성별 */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2">성별</p>
                    <div className="space-y-1.5">
                      {Object.entries(data.participantStats.genderDistribution).map(([gender, ratio], i) => (
                        <div key={gender} className="flex items-center gap-2">
                          <span className="w-14 shrink-0 text-xs text-slate-600">{gender}</span>
                          <div className="flex-1 bg-slate-100 rounded h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded"
                              style={{ width: `${Math.round(ratio * 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs text-slate-600">{Math.round(ratio * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 연령대 */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2">연령대</p>
                    <div className="space-y-1.5">
                      {Object.entries(data.participantStats.ageGroupDistribution).map(([age, ratio], i) => (
                        <div key={age} className="flex items-center gap-2">
                          <span className="w-14 shrink-0 text-xs text-slate-600">{age}</span>
                          <div className="flex-1 bg-slate-100 rounded h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded"
                              style={{ width: `${Math.round(ratio * 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs text-slate-600">{Math.round(ratio * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {data.participantStats.residenceMatchRatio !== null && (
                    <p className="text-xs text-slate-400">
                      거주지 일치 비율: {Math.round(data.participantStats.residenceMatchRatio * 100)}%
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle className="text-sm">참여자 인구통계</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 text-center py-8">정산 완료(SETTLED) 마켓에서만 제공됩니다.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
