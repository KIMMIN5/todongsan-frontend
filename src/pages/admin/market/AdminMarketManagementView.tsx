import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  BATCH_STATUS_BADGE,
  DETAIL_ITEM_STATUS_BADGE,
} from "@/entities/market/lib/adminMarketDetailStatusBadge";
import { getAdminMarketErrorMessage } from "@/entities/market/lib/adminMarketErrorMessage";
import { DISPLAY_STATUS_BADGE } from "@/entities/market/lib/marketDisplayStatusBadge";
import { matchNumericRangeOption } from "@/entities/market/lib/matchNumericRangeOption";
import { useActivateMarketMutation } from "@/entities/market/model/useActivateMarketMutation";
import { useAdminMarketDetailQuery } from "@/entities/market/model/useAdminMarketDetailQuery";
import { useAdminMarketRefundDetailListQuery } from "@/entities/market/model/useAdminMarketRefundDetailListQuery";
import { useAdminMarketRefundSummaryQuery } from "@/entities/market/model/useAdminMarketRefundSummaryQuery";
import { useAdminMarketSettlementDetailListQuery } from "@/entities/market/model/useAdminMarketSettlementDetailListQuery";
import { useAdminMarketSettlementSummaryQuery } from "@/entities/market/model/useAdminMarketSettlementSummaryQuery";
import { useConfirmMarketResultMutation } from "@/entities/market/model/useConfirmMarketResultMutation";
import { useExecuteMarketRefundMutation } from "@/entities/market/model/useExecuteMarketRefundMutation";
import { useExecuteMarketSettlementMutation } from "@/entities/market/model/useExecuteMarketSettlementMutation";
import { useRetryMarketRefundMutation } from "@/entities/market/model/useRetryMarketRefundMutation";
import { useRetryMarketSettlementMutation } from "@/entities/market/model/useRetryMarketSettlementMutation";
import { useVoidMarketMutation } from "@/entities/market/model/useVoidMarketMutation";
import type {
  AdminMarketDetail,
  AdminMarketDetailItemStatus,
  AdminMarketDetailRefundSummary,
  AdminMarketDetailSettlementSummary,
  AdminMarketOption,
  AdminMarketRefundDetailItem,
  AdminMarketRefundReasonType,
  AdminMarketResultRequest,
  AdminMarketSettlementDetailItem,
  MarketDisplayStatus,
  MarketStatus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
  const canVoid = VOIDABLE_MARKET_STATUSES.includes(market.status);

  return (
    <div className="space-y-6">
      <MarketOverviewCard market={market} />
      {market.status === "PENDING" && <ActivateCard marketId={marketId} />}
      <ResultConfirmCard marketId={marketId} market={market} />
      <SettlementCard marketId={marketId} market={market} />
      {canVoid && <VoidCard marketId={marketId} />}
      {market.status === "VOIDED" && <RefundCard marketId={marketId} />}
    </div>
  );
}

/** PENDING Market을 ACTIVE로 전환. 활성화 후에는 사용자가 즉시 예측에 참여할 수 있다. */
function ActivateCard({ marketId }: { marketId: number }) {
  const mutation = useActivateMarketMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleActivate() {
    mutation.mutate(marketId, {
      onSuccess: () => {
        toast.success("마켓이 활성화되었습니다.");
        setConfirmOpen(false);
      },
      onError: (error) => {
        toast.error(getAdminMarketErrorMessage(toApiError(error)));
        setConfirmOpen(false);
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>마켓 활성화</CardTitle>
        <CardDescription>
          PENDING 상태인 마켓을 ACTIVE로 전환하면 사용자가 예측에 참여할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button className="w-full" onClick={() => setConfirmOpen(true)}>
            마켓 활성화
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>마켓을 활성화하시겠습니까?</DialogTitle>
              <DialogDescription>
                활성화하면 사용자가 즉시 예측에 참여할 수 있게 됩니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                취소
              </Button>
              <Button onClick={handleActivate} disabled={mutation.isPending}>
                활성화합니다
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/** MARKET_API_SPEC.md §10 "VOIDED 가능 상태" 기준. SETTLEMENT_IN_PROGRESS/SETTLED/VOIDED는 무효 처리 불가. */
const VOIDABLE_MARKET_STATUSES: MarketStatus[] = [
  "PENDING",
  "ACTIVE",
  "CLOSED",
  "DATA_PENDING",
];

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
          {formatPointAmount(market.totalRealPoolAmount)}
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

        {(market.settlementSummary.settlementId !== null ||
          market.refundSummary.voidId !== null) && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SettlementSummaryBlock summary={market.settlementSummary} />
            <RefundSummaryBlock summary={market.refundSummary} />
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

/** GET /api/v1/admin/markets/{marketId} 응답에 내장된 정산 요약(건수 위주의 lean 요약). */
function SettlementSummaryBlock({
  summary,
}: {
  summary: AdminMarketDetailSettlementSummary;
}) {
  if (summary.settlementId === null) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">정산 요약</h4>
        {summary.status && (
          <Badge variant={BATCH_STATUS_BADGE[summary.status].variant}>
            {BATCH_STATUS_BADGE[summary.status].label}
          </Badge>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="대상" value={`${summary.totalDetailCount}건`} />
        <SummaryStat label="성공" value={`${summary.successCount}건`} />
        <SummaryStat label="실패" value={`${summary.failedCount}건`} />
        <SummaryStat label="불명확" value={`${summary.unknownCount}건`} />
      </dl>
    </div>
  );
}

/** GET /api/v1/admin/markets/{marketId} 응답에 내장된 환불 요약(건수 위주의 lean 요약). */
function RefundSummaryBlock({
  summary,
}: {
  summary: AdminMarketDetailRefundSummary;
}) {
  if (summary.voidId === null) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">환불 요약</h4>
        {summary.refundStatus && (
          <Badge variant={BATCH_STATUS_BADGE[summary.refundStatus].variant}>
            {BATCH_STATUS_BADGE[summary.refundStatus].label}
          </Badge>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="대상" value={`${summary.totalDetailCount}건`} />
        <SummaryStat label="성공" value={`${summary.successCount}건`} />
        <SummaryStat label="실패" value={`${summary.failedCount}건`} />
        <SummaryStat label="불명확" value={`${summary.unknownCount}건`} />
      </dl>
    </div>
  );
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
        <CardContent className="space-y-4">
          {market.settlementSummary.settlementId !== null ? (
            <SettlementSummaryBlock summary={market.settlementSummary} />
          ) : (
            <p className="text-sm text-muted-foreground">정산 진행 중...</p>
          )}
          <SettlementDetailSection marketId={marketId} />
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
          <SettlementSummaryBlock summary={market.settlementSummary} />
          <RefundSummaryBlock summary={market.refundSummary} />
          <SettlementDetailSection marketId={marketId} />
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

const VOID_REASON_OPTIONS: { value: AdminMarketRefundReasonType; label: string }[] = [
  { value: "DATA_UNAVAILABLE", label: "데이터 제공 불가" },
  { value: "ADMIN_ERROR", label: "관리자 설정 오류" },
  { value: "MARKET_CANCELLED", label: "마켓 취소" },
  { value: "NO_TRANSACTION", label: "거래 없음" },
  { value: "ETC", label: "기타" },
];

/**
 * 마켓 무효 처리. PENDING/ACTIVE/CLOSED/DATA_PENDING에서만 노출된다(AdminMarketManagementView의
 * VOIDABLE_MARKET_STATUSES 참고). 되돌릴 수 없는 destructive 액션이라 Dialog 확인을 거친다.
 * 무효 처리는 환불을 직접 실행하지 않으므로, refundRequired가 true면 환불 실행이 별도로 필요하다는
 * 안내만 보여준다(환불 실행 액션 자체는 다음 단계에서 RefundCard에 추가).
 */
function VoidCard({ marketId }: { marketId: number }) {
  const mutation = useVoidMarketMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState<AdminMarketRefundReasonType | null>(
    null,
  );
  const [reason, setReason] = useState("");

  const canSubmit = reasonCode !== null && reason.trim() !== "";

  function handleVoid() {
    if (!reasonCode) return;

    mutation.mutate(
      { marketId, request: { reasonCode, reason: reason.trim() } },
      {
        onSuccess: (data) => {
          toast.success(
            data.refundRequired
              ? `마켓이 무효 처리되었습니다. 환불 대상 ${data.refundablePredictionCount}건이 있어 환불 실행이 필요합니다.`
              : "마켓이 무효 처리되었습니다.",
          );
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
        <CardTitle>마켓 무효 처리</CardTitle>
        <CardDescription>
          공공 데이터 제공 중단, 설정 오류 등으로 더 이상 정상 진행할 수 없는 마켓을
          무효 처리합니다. 무효 처리 후에는 되돌릴 수 없습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">무효 처리 사유</p>
          <Select
            value={reasonCode}
            onValueChange={(value) =>
              setReasonCode(value as AdminMarketRefundReasonType)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="사유를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {VOID_REASON_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">상세 사유</p>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="무효 처리 근거를 입력하세요"
          />
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button
            variant="destructive"
            className="w-full"
            disabled={!canSubmit}
            onClick={() => setConfirmOpen(true)}
          >
            무효 처리하기
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>마켓을 무효 처리하시겠습니까?</DialogTitle>
              <DialogDescription>
                무효 처리 후에는 되돌릴 수 없고, 환불 대상이 있으면 별도로 환불을
                실행해야 합니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleVoid}
                disabled={mutation.isPending}
              >
                무효 처리합니다
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/**
 * 정산 대상 detail 목록(예측 ID/회원 ID/상태/금액). settlementId는 요약 조회로 먼저
 * 알아내며, 조회 API가 상태 필터 없이 전체 건을 내려주므로 정산 진행 중(IN_PROGRESS)과
 * 정산 완료(SETTLED) 화면에서 같은 컴포넌트를 그대로 재사용한다.
 */
function SettlementDetailSection({ marketId }: { marketId: number }) {
  const summaryQuery = useAdminMarketSettlementSummaryQuery(marketId);
  const settlementId = summaryQuery.data?.settlementId ?? null;
  const detailQuery = useAdminMarketSettlementDetailListQuery(
    marketId,
    settlementId,
  );
  const retryMutation = useRetryMarketSettlementMutation();

  if (summaryQuery.isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (summaryQuery.isError) {
    return (
      <ErrorState
        message="정산 현황을 불러오는 중 문제가 발생했습니다."
        action={<Button onClick={() => summaryQuery.refetch()}>다시 시도</Button>}
      />
    );
  }

  if (settlementId === null) {
    return (
      <p className="text-sm text-muted-foreground">정산 기록이 아직 없습니다.</p>
    );
  }

  const totalCount = summaryQuery.data?.totalDetailCount ?? 0;
  const successCount = summaryQuery.data?.successCount ?? 0;
  const failedCount = summaryQuery.data?.failedCount ?? 0;
  const unknownCount = summaryQuery.data?.unknownCount ?? 0;
  const hasRetryTarget = failedCount > 0 || unknownCount > 0;

  function handleRetry() {
    retryMutation.mutate(marketId, {
      onSuccess: () => {
        toast.success("정산 재시도를 요청했습니다.");
      },
      onError: (error) => {
        toast.error(getAdminMarketErrorMessage(toApiError(error)));
      },
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">
          정산 대상 (총 {totalCount}건 · 성공 {successCount}건 · 실패 {failedCount}건 ·
          불명확 {unknownCount}건)
        </h4>
        {hasRetryTarget && (
          <Button size="sm" onClick={handleRetry} disabled={retryMutation.isPending}>
            정산 재시도
          </Button>
        )}
      </div>
      <DetailItemSection
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        onRetry={() => detailQuery.refetch()}
        items={(detailQuery.data?.content ?? []).map(toSettlementDetailRow)}
      />
    </div>
  );
}

/** VOIDED Market의 환불 진행 현황. */
function RefundCard({ marketId }: { marketId: number }) {
  const summaryQuery = useAdminMarketRefundSummaryQuery(marketId);
  const voidId = summaryQuery.data?.voidId ?? null;
  const detailQuery = useAdminMarketRefundDetailListQuery(marketId, voidId);
  const executeMutation = useExecuteMarketRefundMutation();
  const retryMutation = useRetryMarketRefundMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleExecute() {
    executeMutation.mutate(marketId, {
      onSuccess: (data) => {
        toast.success(
          data.refundTargetCount > 0
            ? `환불 실행을 시작했습니다. 대상 ${data.refundTargetCount}건 중 ${data.successCount}건 성공.`
            : "환불 대상이 없어 바로 완료되었습니다.",
        );
        setConfirmOpen(false);
      },
      onError: (error) => {
        toast.error(getAdminMarketErrorMessage(toApiError(error)));
        setConfirmOpen(false);
      },
    });
  }

  function handleRetry() {
    retryMutation.mutate(marketId, {
      onSuccess: () => {
        toast.success("환불 재시도를 요청했습니다.");
      },
      onError: (error) => {
        toast.error(getAdminMarketErrorMessage(toApiError(error)));
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>환불 현황</CardTitle>
        <CardDescription>마켓이 무효 처리되었습니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {summaryQuery.isLoading && <Skeleton className="h-24 w-full" />}

        {summaryQuery.isError && (
          <ErrorState
            message="환불 현황을 불러오는 중 문제가 발생했습니다."
            action={<Button onClick={() => summaryQuery.refetch()}>다시 시도</Button>}
          />
        )}

        {summaryQuery.data && (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat label="대상" value={`${summaryQuery.data.totalDetailCount}건`} />
              <SummaryStat label="성공" value={`${summaryQuery.data.successCount}건`} />
              <SummaryStat label="실패" value={`${summaryQuery.data.failedCount}건`} />
              <SummaryStat label="불명확" value={`${summaryQuery.data.unknownCount}건`} />
            </dl>
            {summaryQuery.data.reasonDetail && (
              <p className="text-sm text-muted-foreground">
                무효 처리 사유: {summaryQuery.data.reasonDetail}
              </p>
            )}

            {voidId === null ? (
              summaryQuery.data.refundRequired ? (
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <Button className="w-full" onClick={() => setConfirmOpen(true)}>
                    환불 실행하기
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>환불을 실행하시겠습니까?</DialogTitle>
                      <DialogDescription>
                        CONFIRMED 예측 참여자에게 원금을 환불합니다. 실행 후에는
                        취소할 수 없습니다.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                        취소
                      </Button>
                      <Button
                        onClick={handleExecute}
                        disabled={executeMutation.isPending}
                      >
                        환불 실행
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="text-sm text-muted-foreground">
                  환불 대상이 없습니다.
                </p>
              )
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground">처리 내역</h4>
                  {(summaryQuery.data.failedCount > 0 ||
                    summaryQuery.data.unknownCount > 0) && (
                    <Button
                      size="sm"
                      onClick={handleRetry}
                      disabled={retryMutation.isPending}
                    >
                      환불 재시도
                    </Button>
                  )}
                </div>
                <DetailItemSection
                  isLoading={detailQuery.isLoading}
                  isError={detailQuery.isError}
                  onRetry={() => detailQuery.refetch()}
                  items={(detailQuery.data?.content ?? []).map(toRefundDetailRow)}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

/**
 * 정산 detail과 환불 detail은 백엔드에서 분리된 별개 타입(AdminMarketSettlementDetailItem /
 * AdminMarketRefundDetailItem)이라 필드명이 다르다(예: settledAmount vs refundAmount,
 * failureReason 명칭은 동일). 화면 표 하나로 같이 보여주기 위해 공용 row 모양으로 정규화한다.
 */
type DetailRow = {
  id: number;
  predictionId: number;
  memberId: number;
  status: AdminMarketDetailItemStatus;
  amount: string;
  failureReason: string | null;
};

function toSettlementDetailRow(item: AdminMarketSettlementDetailItem): DetailRow {
  return {
    id: item.settlementDetailId,
    predictionId: item.predictionId,
    memberId: item.memberId,
    status: item.status,
    amount: item.settledAmount,
    failureReason: item.failureReason,
  };
}

function toRefundDetailRow(item: AdminMarketRefundDetailItem): DetailRow {
  return {
    id: item.refundDetailId,
    predictionId: item.predictionId,
    memberId: item.memberId,
    status: item.status,
    amount: item.refundAmount,
    failureReason: item.failureReason,
  };
}

function DetailItemSection({
  isLoading,
  isError,
  onRetry,
  items,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  items: DetailRow[];
}) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="처리 건 목록을 불러오는 중 문제가 발생했습니다."
        action={<Button onClick={onRetry}>다시 시도</Button>}
      />
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">표시할 처리 건이 없습니다.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>예측 ID</TableHead>
          <TableHead>회원 ID</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>금액</TableHead>
          <TableHead>실패 사유</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => {
          const badge = DETAIL_ITEM_STATUS_BADGE[row.status];
          return (
            <TableRow key={row.id}>
              <TableCell className="tabular-nums">{row.predictionId}</TableCell>
              <TableCell className="tabular-nums">{row.memberId}</TableCell>
              <TableCell>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </TableCell>
              <TableCell className="tabular-nums">
                {formatPointAmount(row.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.failureReason ?? "-"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
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
