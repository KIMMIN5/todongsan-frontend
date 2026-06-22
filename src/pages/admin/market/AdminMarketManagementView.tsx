import { useMemo, useState } from "react";
import { toast } from "sonner";

import { getAdminMarketErrorMessage } from "@/entities/market/lib/adminMarketErrorMessage";
import { DISPLAY_STATUS_BADGE } from "@/entities/market/lib/marketDisplayStatusBadge";
import { matchNumericRangeOption } from "@/entities/market/lib/matchNumericRangeOption";
import { useAdminMarketDetailQuery } from "@/entities/market/model/useAdminMarketDetailQuery";
import { useConfirmMarketResultMutation } from "@/entities/market/model/useConfirmMarketResultMutation";
import { useExecuteMarketSettlementMutation } from "@/entities/market/model/useExecuteMarketSettlementMutation";
import type {
  AdminMarketDetail,
  AdminMarketOption,
  AdminMarketResultRequest,
  MarketDisplayStatus,
  MarketSummaryRecord,
} from "@/entities/market/model/market.types";
import { toApiError } from "@/shared/api/apiError";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMarketPrice, formatPointAmount } from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Textarea } from "@/shared/ui/textarea";

type AdminMarketManagementViewProps = {
  marketId: number;
};

export function AdminMarketManagementView({
  marketId,
}: AdminMarketManagementViewProps) {
  const detailQuery = useAdminMarketDetailQuery(marketId);

  if (detailQuery.isLoading) {
    return <AdminMarketDetailSkeleton />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ErrorState
        message="마켓 정보를 불러오는 중 문제가 발생했습니다."
        action={<Button onClick={() => detailQuery.refetch()}>다시 시도</Button>}
      />
    );
  }

  const market = detailQuery.data;

  return (
    <div className="space-y-6">
      <MarketOverviewCard market={market} />
      <ResultConfirmCard marketId={marketId} market={market} />
      <SettlementCard marketId={marketId} market={market} />
    </div>
  );
}

function MarketOverviewCard({ market }: { market: AdminMarketDetail }) {
  const badge = DISPLAY_STATUS_BADGE[market.displayStatus];
  const isNumericRange = market.answerType === "NUMERIC_RANGE";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{market.title}</CardTitle>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <CardDescription>
          마감 {formatDate(market.closeAt)} · 유동성{" "}
          {formatPointAmount(market.totalRealPoolAmount ?? market.totalPoolAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {market.description && (
          <p className="text-sm text-muted-foreground">{market.description}</p>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>선택지</TableHead>
              {isNumericRange && <TableHead>구간</TableHead>}
              <TableHead>예측률</TableHead>
              <TableHead>실제 풀</TableHead>
              <TableHead>가상 풀</TableHead>
              <TableHead>체결 수량</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {market.options.map((option) => (
              <TableRow key={option.optionId}>
                <TableCell className="font-medium text-foreground">
                  {option.content}
                </TableCell>
                {isNumericRange && (
                  <TableCell className="text-muted-foreground">
                    {formatRangeLabel(option)}
                  </TableCell>
                )}
                <TableCell className="tabular-nums">
                  {formatMarketPrice(option.currentPrice, 2)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatPointAmount(option.realPoolAmount)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatPointAmount(option.virtualPoolAmount)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatMarketPrice(option.totalContractQuantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {(market.settlementSummary || market.refundSummary) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {market.settlementSummary && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">정산 요약</h4>
                <SummaryRecordList record={market.settlementSummary} />
              </div>
            )}
            {market.refundSummary && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">환불 요약</h4>
                <SummaryRecordList record={market.refundSummary} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRangeLabel(option: AdminMarketOption): string {
  if (option.rangeMin === undefined || option.rangeMax === undefined) return "-";
  const left = option.minInclusive === false ? "(" : "[";
  const right = option.maxInclusive === false ? ")" : "]";
  return `${left}${formatMarketPrice(option.rangeMin)} ~ ${formatMarketPrice(option.rangeMax)}${right}`;
}

function SummaryRecordList({ record }: { record: MarketSummaryRecord }) {
  const entries = Object.entries(record);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">표시할 요약 정보가 없습니다.</p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg bg-muted/40 p-3">
          <dt className="text-xs text-muted-foreground">{key}</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
            {formatSummaryValue(key, value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatSummaryValue(
  key: string,
  value: string | number | boolean | null,
): string {
  if (value === null) return "-";
  if (typeof value === "string" && /amount/i.test(key)) {
    return formatPointAmount(value);
  }
  return String(value);
}

function ResultConfirmCard({
  marketId,
  market,
}: {
  marketId: number;
  market: AdminMarketDetail;
}) {
  const mutation = useConfirmMarketResultMutation();
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [resultValue, setResultValue] = useState("");
  const [resultText, setResultText] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isActive = market.displayStatus === "CLOSED_BY_TIME";
  const isNumericRange = market.answerType === "NUMERIC_RANGE";
  const pendingCount = market.pendingPredictionCount;
  const hasPendingPredictions = typeof pendingCount === "number" && pendingCount > 0;
  const isAnswerReady = isNumericRange
    ? resultValue.trim() !== ""
    : selectedOptionId !== null;
  const canSubmit = isActive && !hasPendingPredictions && isAnswerReady;

  const rangePreview = useMemo(
    () =>
      isNumericRange
        ? matchNumericRangeOption(resultValue, market.options)
        : null,
    [isNumericRange, resultValue, market.options],
  );

  const selectedAnswerLabel = isNumericRange
    ? resultValue
    : market.options.find((option) => option.optionId === selectedOptionId)?.content ??
      "";

  function handleConfirm() {
    const request: AdminMarketResultRequest = isNumericRange
      ? { resultValue: resultValue.trim() }
      : { resultOptionId: selectedOptionId ?? undefined };

    if (resultText.trim() !== "") {
      request.resultText = resultText.trim();
    }

    mutation.mutate(
      { marketId, request },
      {
        onSuccess: () => {
          toast.success("결과가 확정되었습니다.");
          setConfirmOpen(false);
        },
        onError: (error) => {
          toast.error(getAdminMarketErrorMessage(toApiError(error)));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>결과 확정</CardTitle>
          <Badge variant={DISPLAY_STATUS_BADGE[market.displayStatus].variant}>
            {DISPLAY_STATUS_BADGE[market.displayStatus].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive && (
          <p className="text-sm text-muted-foreground">
            {resultConfirmInactiveMessage(market.displayStatus)}
          </p>
        )}

        {isActive && (
          <>
            {typeof pendingCount === "number" && (
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  hasPendingPredictions
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700",
                )}
              >
                {hasPendingPredictions
                  ? `처리 대기 중인 예측 ${pendingCount}건 — 모두 처리된 뒤 결과를 확정할 수 있습니다`
                  : `처리 대기 중인 예측 ${pendingCount}건 — 결과 확정 가능`}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">정답 선택지</p>
              {isNumericRange ? (
                <div className="space-y-2">
                  <Input
                    value={resultValue}
                    onChange={(event) => setResultValue(event.target.value)}
                    placeholder="실제값을 입력하세요"
                    inputMode="decimal"
                  />
                  {rangePreview?.status === "matched" && (
                    <p className="text-sm text-emerald-700">
                      이 값이면 정답은 &quot;{rangePreview.option.content}&quot;입니다.
                      (최종 판정은 서버에서 이뤄집니다)
                    </p>
                  )}
                  {rangePreview?.status === "none" && (
                    <p className="text-sm text-amber-700">
                      매칭되는 구간이 없습니다. (최종 판정은 서버에서 이뤄집니다)
                    </p>
                  )}
                  {rangePreview?.status === "ambiguous" && (
                    <p className="text-sm text-amber-700">
                      2개 이상의 구간과 일치합니다. (최종 판정은 서버에서 이뤄집니다)
                    </p>
                  )}
                  {rangePreview?.status === "invalid" && (
                    <p className="text-sm text-destructive">
                      숫자 형식으로 입력해주세요.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {market.options.map((option) => {
                    const selected = selectedOptionId === option.optionId;
                    return (
                      <button
                        key={option.optionId}
                        type="button"
                        onClick={() => setSelectedOptionId(option.optionId)}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        {option.content}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">근거(선택)</p>
              <Textarea
                value={resultText}
                onChange={(event) => setResultText(event.target.value)}
                placeholder="공식 발표 기준 등 판단 근거"
              />
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <Button
                className="w-full"
                disabled={!canSubmit}
                onClick={() => setConfirmOpen(true)}
              >
                결과 확정하기
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>결과를 확정하시겠습니까?</DialogTitle>
                  <DialogDescription>
                    결과 확정 후에는 정답을 수정할 수 없습니다. 잘못 확정한 경우 정산
                    시작 전까지만 마켓 무효 처리가 가능합니다.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm">
                  선택한 정답: <span className="font-semibold">{selectedAnswerLabel}</span>
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleConfirm} disabled={mutation.isPending}>
                    확정합니다
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function resultConfirmInactiveMessage(displayStatus: MarketDisplayStatus): string {
  switch (displayStatus) {
    case "PENDING":
    case "ACTIVE":
    case "DATA_PENDING":
      return "마감 후 결과를 확정할 수 있습니다.";
    case "VOIDED":
      return "마켓이 무효 처리되었습니다.";
    default:
      return "이미 결과가 확정되었습니다.";
  }
}

function SettlementCard({
  marketId,
  market,
}: {
  marketId: number;
  market: AdminMarketDetail;
}) {
  const mutation = useExecuteMarketSettlementMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleExecute() {
    mutation.mutate(marketId, {
      onSuccess: () => {
        toast.success("정산이 시작되었습니다.");
        setConfirmOpen(false);
      },
      onError: (error) => {
        toast.error(getAdminMarketErrorMessage(toApiError(error)));
        setConfirmOpen(false);
      },
    });
  }

  if (market.status === "SETTLEMENT_IN_PROGRESS") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>정산 실행</CardTitle>
          <CardDescription>정산이 진행 중입니다. 잠시 후 자동으로 완료됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {market.settlementSummary ? (
            <SummaryRecordList record={market.settlementSummary} />
          ) : (
            <p className="text-sm text-muted-foreground">정산 진행 중...</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (market.status === "SETTLED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>정산 완료</CardTitle>
          <CardDescription>정산이 완료되었습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {market.settlementSummary && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">정산 요약</h4>
              <SummaryRecordList record={market.settlementSummary} />
            </div>
          )}
          {market.refundSummary && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">환불 요약</h4>
              <SummaryRecordList record={market.refundSummary} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const isActive = market.status === "CLOSED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>정산 실행</CardTitle>
        <CardDescription>
          {isActive
            ? "결과가 확정되었습니다(status: CLOSED). 정산을 실행할 수 있습니다."
            : "결과가 확정되면(status: CLOSED) 정산을 실행할 수 있습니다."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button
            className="w-full"
            disabled={!isActive}
            onClick={() => setConfirmOpen(true)}
          >
            정산 실행{!isActive && " (비활성)"}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>정산을 시작하시겠습니까?</DialogTitle>
              <DialogDescription>
                정산을 시작하면 취소할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                취소
              </Button>
              <Button onClick={handleExecute} disabled={mutation.isPending}>
                정산 시작
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function AdminMarketDetailSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full" />
      ))}
    </div>
  );
}
