import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Loader2 } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import { useBattleInsightReportQuery } from "@/entities/insight/model/useBattleInsightReportQuery";
import { useBattleInsightStatusQuery } from "@/entities/insight/model/useBattleInsightStatusQuery";
import { InsightReportStatusBadge } from "@/entities/insight/ui/InsightReportStatusBadge";
import type { BattleStatus } from "@/entities/battle/model/battle.types";
import { ROUTE_PATH } from "@/shared/constants/routePath";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";

import { useRequestBattleReport } from "../model/useRequestBattleReport";

const POLLING_TIMEOUT_MS = 60_000;

type BattleReportSectionProps = {
  battleId: number;
  battleStatus: BattleStatus;
  isAuthenticated: boolean;
};

export function BattleReportSection({
  battleId,
  battleStatus,
  isAuthenticated,
}: BattleReportSectionProps) {
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: report,
    error: reportError,
    isError: isReportError,
    isLoading: isReportLoading,
    refetch: refetchReport,
  } = useBattleInsightReportQuery(battleId);

  const { data: statusData } = useBattleInsightStatusQuery(battleId, {
    enabled: pollingEnabled,
  });

  const { requestReport, isPending: isRequesting, error: requestError } =
    useRequestBattleReport(battleId);

  const isNotFound =
    isApiError(reportError) &&
    reportError.errorCode === "INSIGHT_REPORT_NOT_FOUND";

  const isInProgress =
    report?.status === "PENDING" || report?.status === "PROCESSING";

  useEffect(() => {
    if (isInProgress) setPollingEnabled(true);
  }, [isInProgress]);

  useEffect(() => {
    if (!pollingEnabled) return;
    timerRef.current = setTimeout(() => setPollingEnabled(false), POLLING_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pollingEnabled]);

  useEffect(() => {
    if (statusData?.status === "DONE" || statusData?.status === "FAILED") {
      setPollingEnabled(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      refetchReport();
    }
  }, [statusData?.status, refetchReport]);

  // 종료된 배틀에서만 노출
  if (battleStatus !== "CLOSED") return null;

  const requestErrorMessage = isApiError(requestError)
    ? requestError.message
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 분석 리포트</CardTitle>
      </CardHeader>
      <CardContent>
        {isReportLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* 리포트 없음 → 요청 버튼 */}
        {!isReportLoading && isNotFound && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
            <div className="flex items-center justify-center rounded-full bg-violet-100 p-3 dark:bg-violet-950">
              <BrainCircuit className="size-8 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">배틀 데이터 AI 분석 리포트</p>
              <p className="text-xs text-muted-foreground">
                투표 패턴을 연령·성별·지역별로 세분화해 분석합니다.
                생성 시 <span className="font-semibold text-foreground">80P</span>가 차감됩니다.
              </p>
              {requestErrorMessage && (
                <p className="text-xs text-destructive">{requestErrorMessage}</p>
              )}
            </div>
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  requestReport();
                  setPollingEnabled(true);
                }}
                disabled={isRequesting}
              >
                {isRequesting ? "요청 중..." : "AI 리포트 보기 (80P)"}
              </Button>
            ) : (
              <Button variant="outline" render={<Link to={ROUTE_PATH.LOGIN} />}>
                로그인 후 생성 가능
              </Button>
            )}
          </div>
        )}

        {/* 로드 에러 (404 제외) */}
        {isReportError && !isNotFound && (
          <ErrorState
            message={
              isApiError(reportError)
                ? reportError.message
                : "리포트를 불러오는 중 문제가 발생했습니다."
            }
            action={<Button onClick={() => refetchReport()}>다시 시도</Button>}
          />
        )}

        {/* 분석 중 */}
        {!isReportLoading && report && isInProgress && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <InsightReportStatusBadge status={report.status} />
            <Loader2 className="size-6 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">
              AI가 배틀 데이터를 분석 중입니다. 완료되면 자동으로 표시됩니다...
            </p>
          </div>
        )}

        {/* 분석 실패 */}
        {!isReportLoading && report?.status === "FAILED" && (
          <ErrorState
            title="AI 리포트 생성에 실패했습니다"
            message="다시 시도하면 포인트가 재차감되지 않습니다."
            action={
              <Button
                onClick={() => {
                  requestReport();
                  setPollingEnabled(true);
                }}
                disabled={isRequesting}
              >
                {isRequesting ? "요청 중..." : "다시 시도"}
              </Button>
            }
          />
        )}

        {/* 분석 완료 */}
        {!isReportLoading && report?.status === "DONE" && (
          <div className="space-y-4">
            <InsightReportStatusBadge status="DONE" />
            {report.summary && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {report.summary}
              </p>
            )}
            {report.content && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {report.content}
                </pre>
              </div>
            )}
            {report.generatedAt && (
              <p className="text-right text-xs text-muted-foreground">
                분석 완료: {new Date(report.generatedAt).toLocaleString("ko-KR")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
