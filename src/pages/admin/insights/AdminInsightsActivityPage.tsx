import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminActivityTrendQuery } from "@/entities/insight/model/useAdminActivityTrendQuery";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export default function AdminInsightsActivityPage() {
  const { data, isLoading, isError, refetch } = useAdminActivityTrendQuery();

  return (
    <PageContainer>
      <PageHeader
        title="플랫폼 활동 트렌드"
        description="주간 방문 인증·AI 리포트·예측 결과 추이"
      />

      {isLoading && <Skeleton className="h-80 rounded-xl" />}

      {isError && (
        <ErrorState
          message="활동 트렌드를 불러오지 못했습니다."
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && (
        <div className="space-y-6">
          {data.weeklyTrend.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-sm text-slate-400">집계된 주간 데이터가 없습니다.</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">주간 활동 추이 ({data.period})</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={data.weeklyTrend.map((w) => ({
                      week: w.weekStart,
                      방문인증: w.newVisitCerts,
                      AI리포트: w.aiReportsCompleted,
                      예측결과: w.predictionResultsProcessed,
                    }))}
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="방문인증" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="AI리포트" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="예측결과" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {data.weeklyTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">주차별 수치</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="text-left py-2 pr-4 font-medium">주 시작일</th>
                        <th className="text-right py-2 px-3 font-medium">방문 인증</th>
                        <th className="text-right py-2 px-3 font-medium">AI 리포트</th>
                        <th className="text-right py-2 px-3 font-medium">AI 성공률</th>
                        <th className="text-right py-2 pl-3 font-medium">예측 결과</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.weeklyTrend].reverse().map((w) => (
                        <tr key={w.weekStart} className="border-b border-slate-50 last:border-0">
                          <td className="py-1.5 pr-4 text-slate-700">{w.weekStart}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-slate-800">{w.newVisitCerts.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-slate-800">{w.aiReportsCompleted.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-slate-800">
                            {w.aiReportSuccessRate !== null ? `${Math.round(w.aiReportSuccessRate * 100)}%` : "—"}
                          </td>
                          <td className="py-1.5 pl-3 text-right font-medium text-slate-800">{w.predictionResultsProcessed.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageContainer>
  );
}
