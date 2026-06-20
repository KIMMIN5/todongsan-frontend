import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { isApiError } from "@/shared/api/apiError";
import { useMarketInsightReportQuery } from "@/entities/insight/model/useMarketInsightReportQuery";
import { useMarketInsightStatusQuery } from "@/entities/insight/model/useMarketInsightStatusQuery";
import { InsightReportCard } from "@/entities/insight/ui/InsightReportCard";
import { useMarketDetailQuery } from "@/entities/market/model/useMarketDetailQuery";
import { MarketOptionList } from "@/entities/market/ui/MarketOptionList";
import { MarketReportRequestSection } from "@/features/request-market-report/ui/MarketReportRequestSection";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatPointAmount } from "@/shared/lib/formatDecimal";
import { MarkdownContent } from "@/shared/ui/markdown-content";

const POLLING_TIMEOUT_MS = 30_000;

export default function MarketReportPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const isValidId = marketId !== undefined && /^\d+$/.test(marketId);
  const parsedId = isValidId ? Number(marketId) : 0;

  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: report,
    error: reportError,
    isError: isReportError,
    isLoading: isReportLoading,
    refetch: refetchReport,
  } = useMarketInsightReportQuery(parsedId);

  const { data: statusData } = useMarketInsightStatusQuery(parsedId, {
    enabled: pollingEnabled,
  });

  const { data: marketDetail } = useMarketDetailQuery(parsedId);

  const isNotFound =
    isApiError(reportError) &&
    reportError.errorCode === "INSIGHT_REPORT_NOT_FOUND";

  const isInProgress =
    report?.status === "PENDING" || report?.status === "PROCESSING";

  // 리포트가 처리 중이면 polling 시작
  useEffect(() => {
    if (isInProgress) {
      setPollingEnabled(true);
    }
  }, [isInProgress]);

  // polling 활성화 시 30초 타임아웃
  useEffect(() => {
    if (!pollingEnabled) return;

    timerRef.current = setTimeout(() => {
      setPollingEnabled(false);
      setPollingTimedOut(true);
    }, POLLING_TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pollingEnabled]);

  // status가 DONE/FAILED이 되면 polling 중단 후 전체 리포트 재조회
  useEffect(() => {
    if (statusData?.status === "DONE" || statusData?.status === "FAILED") {
      setPollingEnabled(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      refetchReport();
    }
  }, [statusData?.status, refetchReport]);

  function handleRequested() {
    setPollingTimedOut(false);
    setPollingEnabled(true);
  }

  if (!isValidId) {
    return (
      <PageContainer>
        <PageHeader title="AI 리포트" />
        <ErrorState
          title="잘못된 마켓 주소입니다"
          message="마켓 ID를 확인한 뒤 다시 시도해 주세요."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="AI 리포트" description={`마켓 #${marketId}`} />

      {isReportLoading && <MarketReportSkeleton />}

      {/* 리포트 없음 → 요청 화면 */}
      {!isReportLoading && isNotFound && (
        <div className="flex flex-col gap-6">
          <MarketReportRequestSection
            marketId={parsedId}
            onRequested={handleRequested}
          />
          {marketDetail && (
            <MarketOptionsCard
              totalPoolAmount={marketDetail.totalPoolAmount}
              options={marketDetail.options}
            />
          )}
        </div>
      )}

      {/* 리포트 로드 에러 (404 제외) */}
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
        <div className="flex flex-col gap-4">
          <InsightReportCard report={report} />
          <p className="text-center text-sm text-muted-foreground">
            {pollingTimedOut
              ? "처리 상태를 확인할 수 없습니다. 잠시 후 다시 확인해 주세요."
              : "AI가 열심히 분석 중입니다. 완료되면 자동으로 표시됩니다..."}
          </p>
        </div>
      )}

      {/* 분석 실패 */}
      {!isReportLoading && report?.status === "FAILED" && (
        <div className="flex flex-col gap-4">
          <InsightReportCard report={report} />
          <ErrorState
            title="AI 리포트 생성에 실패했습니다"
            message="차감된 포인트는 자동으로 환불됩니다."
            action={
              <Button onClick={() => refetchReport()}>다시 확인</Button>
            }
          />
        </div>
      )}

      {/* 분석 완료 */}
      {!isReportLoading && report?.status === "DONE" && (
        <div className="flex flex-col gap-6">
          <InsightReportCard report={report} />

          {marketDetail && (
            <MarketOptionsCard
              totalPoolAmount={marketDetail.totalPoolAmount}
              options={marketDetail.options}
            />
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
        </div>
      )}
    </PageContainer>
  );
}

function MarketReportSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

type MarketOptionsCardProps = {
  totalPoolAmount: string;
  options: { optionId: number; content: string; currentPrice: string; realPoolAmount?: string; virtualPoolAmount?: string }[];
};

function MarketOptionsCard({ totalPoolAmount, options }: MarketOptionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
        <CardTitle>마켓 옵션 현황</CardTitle>
        <span className="text-xs text-muted-foreground">
          총 풀 {formatPointAmount(totalPoolAmount)}
        </span>
      </CardHeader>
      <CardContent>
        <MarketOptionList options={options} />
      </CardContent>
    </Card>
  );
}
