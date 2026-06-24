import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { isApiError } from "@/shared/api/apiError";
import { useBattleDetailQuery } from "@/entities/battle/model/useBattleDetailQuery";
import { useBattleResultQuery } from "@/entities/battle/model/useBattleResultQuery";
import { BattleVoteResult } from "@/entities/battle/ui/BattleVoteResult";
import { useAdminBattleInsightReportQuery } from "@/entities/insight/model/useAdminBattleInsightReportQuery";
import { InsightReportCard } from "@/entities/insight/ui/InsightReportCard";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { MarkdownContent } from "@/shared/ui/markdown-content";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

const OPTION_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

export default function AdminBattleReportPage() {
  const { battleId } = useParams<{ battleId: string }>();
  const isValidId = battleId !== undefined && /^\d+$/.test(battleId);
  const parsedId = isValidId ? Number(battleId) : 0;

  const { data: report, isLoading, isError, error, refetch } =
    useAdminBattleInsightReportQuery(parsedId);

  const { data: battleDetail } = useBattleDetailQuery(parsedId);
  const { data: battleResult } = useBattleResultQuery(parsedId);
  const analysis = report?.status === "DONE" ? report.analysisData : undefined;

  const isNotFound =
    isApiError(error) && error.errorCode === "INSIGHT_REPORT_NOT_FOUND";

  if (!isValidId) {
    return (
      <PageContainer>
        <PageHeader title="배틀 AI 리포트" />
        <ErrorState
          title="잘못된 배틀 주소입니다"
          message="배틀 ID를 확인한 뒤 다시 시도해 주세요."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="배틀 AI 리포트"
        description={`배틀 #${battleId} AI 분석 리포트`}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {isNotFound && (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 AI 리포트가 생성되지 않았습니다. 배틀 종료 후 자동으로 생성됩니다.
          </p>
        </div>
      )}

      {isError && !isNotFound && (
        <ErrorState
          message={
            isApiError(error)
              ? error.message
              : "리포트를 불러오는 중 문제가 발생했습니다."
          }
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {/* 분석 중 (polling 자동 진행) */}
      {!isLoading && report && (report.status === "PENDING" || report.status === "PROCESSING") && (
        <div className="flex flex-col gap-4">
          <InsightReportCard report={report} />
          <p className="text-center text-sm text-muted-foreground">
            AI가 배틀 데이터를 분석 중입니다. 완료되면 자동으로 표시됩니다...
          </p>
        </div>
      )}

      {/* 분석 실패 */}
      {!isLoading && report?.status === "FAILED" && (
        <div className="flex flex-col gap-4">
          <InsightReportCard report={report} />
          <ErrorState
            title="AI 리포트 생성에 실패했습니다"
            message="배틀 데이터를 다시 확인해 주세요."
            action={<Button onClick={() => refetch()}>다시 확인</Button>}
          />
        </div>
      )}

      {/* 분석 완료 */}
      {!isLoading && report?.status === "DONE" && (
        <div className="flex flex-col gap-6">
          <InsightReportCard report={report} />

          {battleDetail && battleResult && (
            <Card>
              <CardHeader>
                <CardTitle>투표 집계</CardTitle>
              </CardHeader>
              <CardContent>
                <BattleVoteResult
                  optionALabel={battleDetail.optionA}
                  optionBLabel={battleDetail.optionB}
                  result={battleResult}
                />
              </CardContent>
            </Card>
          )}

          {report.content && (
            <Card>
              <CardHeader>
                <CardTitle>AI 분석 리포트</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownContent content={report.content} />
              </CardContent>
            </Card>
          )}

          {/* 투표 통계 바차트 */}
          {analysis && analysis.optionDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>옵션별 투표 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analysis.optionDistribution.map((o) => ({
                      name: o.optionLabel,
                      득표수: o.count,
                    }))}
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="득표수" radius={[4, 4, 0, 0]}>
                      {analysis.optionDistribution.map((_, i) => (
                        <Cell key={i} fill={OPTION_COLORS[i % OPTION_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400 text-right mt-1">
                  총 {analysis.totalVotes.toLocaleString()}표
                </p>
              </CardContent>
            </Card>
          )}

          {/* 성별 × 옵션 누적 바차트 — genderByOption: {"찬성": {"MALE": 0.65, ...}} */}
          {analysis && Object.keys(analysis.genderByOption).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>성별 × 옵션 교차 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={["MALE", "FEMALE"].map((gender) => ({
                      segment: gender,
                      ...Object.fromEntries(
                        Object.entries(analysis.genderByOption).map(([opt, genderMap]) => [
                          opt,
                          Math.round((genderMap[gender] ?? 0) * 100),
                        ]),
                      ),
                    }))}
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="segment" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip unit="%" />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {analysis.optionDistribution.map((o, i) => (
                      <Bar
                        key={o.optionLabel}
                        dataKey={o.optionLabel}
                        stackId="a"
                        fill={OPTION_COLORS[i % OPTION_COLORS.length]}
                        radius={i === analysis.optionDistribution.length - 1 ? [4, 4, 0, 0] : undefined}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 연령대 × 옵션 누적 바차트 — ageGroupByOption: {"찬성": {"20대": 0.51, ...}} */}
          {analysis && Object.keys(analysis.ageGroupByOption).length > 0 && (() => {
            const ageGroups = Array.from(
              new Set(Object.values(analysis.ageGroupByOption).flatMap(Object.keys))
            );
            return (
              <Card>
                <CardHeader>
                  <CardTitle>연령대 × 옵션 교차 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={ageGroups.map((age) => ({
                        segment: age,
                        ...Object.fromEntries(
                          Object.entries(analysis.ageGroupByOption).map(([opt, ageMap]) => [
                            opt,
                            Math.round((ageMap[age] ?? 0) * 100),
                          ]),
                        ),
                      }))}
                      margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="segment" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip unit="%" />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {analysis.optionDistribution.map((o, i) => (
                        <Bar
                          key={o.optionLabel}
                          dataKey={o.optionLabel}
                          stackId="a"
                          fill={OPTION_COLORS[i % OPTION_COLORS.length]}
                          radius={i === analysis.optionDistribution.length - 1 ? [4, 4, 0, 0] : undefined}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </PageContainer>
  );
}
