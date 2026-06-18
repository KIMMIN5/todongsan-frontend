import type {
  MarketDisplayStatus,
  MarketStatus,
} from "@/entities/market/model/market.types";
import {
  MARKET_CAPTIONS,
  MARKET_LABELS,
} from "@/entities/market/lib/marketLabels";
import type { OptionColor } from "@/entities/market/lib/optionColor";
import { toDecimal } from "@/shared/lib/decimal";
import {
  formatMarketPrice,
  formatPercent,
  formatPointAmount,
} from "@/shared/lib/formatDecimal";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { MyMarketPrediction } from "../model/prediction.types";
import { PredictionStatusBadge } from "./PredictionStatusBadge";

type MyMarketPredictionCardProps = {
  prediction: MyMarketPrediction;
  selectedOptionLabel?: string;
  marketStatus?: MarketStatus;
  marketDisplayStatus?: MarketDisplayStatus;
  optionColor?: OptionColor;
};

/** 양수 +, 음수 −(빨강 미사용) 부호를 붙인 포인트 문자열. */
function formatSignedPoint(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const d = toDecimal(value);
  const sign = d.greaterThan(0) ? "+" : d.lessThan(0) ? "−" : "";
  return `${sign}${formatPointAmount(d.abs().toString(), 2)}`;
}

/**
 * "이미 퍼센트 단위"인 값(예: estimatedProfitRateIfWin "944.90" = 944.90%)을 표시한다.
 * ratio(0~1)가 아니므로 ×100 변환을 하지 않고, 소수 2자리 고정 + 부호(+/−)만 붙인다.
 * ⚠️ priceSnapshot/currentPrice 같은 0~1 ratio 값은 formatPercent(×100)를 써야 한다. 혼동 금지.
 */
function formatSignedPercentValue(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const d = toDecimal(value);
  const sign = d.greaterThan(0) ? "+" : d.lessThan(0) ? "−" : "";
  return `${sign}${d.abs().toFixed(2)}%`;
}

function formatContractQuantity(value: string | null | undefined): string {
  const formatted = formatMarketPrice(value, 2);
  return formatted === "-" ? formatted : `${formatted}계약`;
}

export function MyMarketPredictionCard({
  prediction,
  selectedOptionLabel,
  marketStatus,
  marketDisplayStatus,
  optionColor,
}: MyMarketPredictionCardProps) {
  const optionLabel =
    selectedOptionLabel ?? `옵션 ${prediction.selectedOptionId}`;

  const status = prediction.status;
  const isFailed = status === "FAILED";
  const isSettled = status === "SETTLED";
  const isConfirmed = status === "CONFIRMED";
  const isChecking = status === "POINT_PENDING" || status === "POINT_UNKNOWN";
  const isRefund =
    status === "REFUND_PENDING" ||
    status === "REFUND_UNKNOWN" ||
    status === "REFUNDED";

  return (
    <Card className="relative">
      {/* 좌측 옵션색 accent 바 (작업 0 헬퍼 색) */}
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: optionColor?.base }}
      />

      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="font-medium">내 예측</CardTitle>
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: optionColor?.base }}
              />
              <span className="truncate text-sm text-muted-foreground">
                {optionLabel}
              </span>
            </span>
          </div>
          <PredictionStatusBadge
            status={status}
            marketStatus={marketStatus}
            marketDisplayStatus={marketDisplayStatus}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 메트릭: 참여 포인트 / 참여 시 예측률 / 적중 지분 */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Metric
              label={MARKET_LABELS.entryPoint}
              value={formatPointAmount(prediction.pointAmount)}
            />
            {!isFailed && (
              <>
                <Metric
                  label={MARKET_LABELS.entryPredictionRate}
                  value={
                    prediction.priceSnapshot
                      ? formatPercent(prediction.priceSnapshot)
                      : "확인 중"
                  }
                />
                <Metric
                  label={MARKET_LABELS.winShare}
                  value={
                    prediction.contractQuantity
                      ? formatContractQuantity(prediction.contractQuantity)
                      : "확인 중"
                  }
                />
              </>
            )}
          </div>
          {!isFailed && (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {MARKET_CAPTIONS.winShare}
            </p>
          )}
        </div>

        {/* 상태별 손익/정산 영역 */}
        {isFailed && (
          <p className="text-sm text-muted-foreground">
            예측 참여가 실패한 건입니다. 손익은 발생하지 않습니다.
          </p>
        )}

        {isChecking && (
          <p className="text-sm text-muted-foreground">
            예상 정산 정보를 확인 중입니다.
          </p>
        )}

        {isRefund && (
          <p className="text-sm text-muted-foreground">
            환불 처리 대상 건입니다. 손익은 발생하지 않습니다.
          </p>
        )}

        {isSettled && <SettledOutcome settledAmount={prediction.settledAmount} />}

        {isConfirmed && (
          <EstimatedOutcome
            estimatedProfitIfWin={prediction.estimatedProfitIfWin}
            estimatedPayoutIfWin={prediction.estimatedPayoutIfWin}
            estimatedProfitRateIfWin={prediction.estimatedProfitRateIfWin}
          />
        )}
      </CardContent>
    </Card>
  );
}

type SettledOutcomeProps = {
  settledAmount: string | null | undefined;
};

function SettledOutcome({ settledAmount }: SettledOutcomeProps) {
  if (settledAmount === null || settledAmount === undefined) {
    return (
      <p className="text-sm text-muted-foreground">정산 정보를 확인 중입니다.</p>
    );
  }

  const isWin = toDecimal(settledAmount).greaterThan(0);

  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {MARKET_LABELS.settlementAmount}
          </p>
          <p
            className={cn(
              "mt-0.5 text-2xl font-medium tabular-nums",
              isWin ? "text-green-600" : "text-muted-foreground",
            )}
          >
            {formatPointAmount(settledAmount, 2)}
          </p>
        </div>
        {!isWin && (
          <span className="pb-1 text-sm text-muted-foreground">미적중</span>
        )}
      </div>
    </div>
  );
}

type EstimatedOutcomeProps = {
  estimatedProfitIfWin: string | null | undefined;
  estimatedPayoutIfWin: string | null | undefined;
  estimatedProfitRateIfWin: string | null | undefined;
};

function EstimatedOutcome({
  estimatedProfitIfWin,
  estimatedPayoutIfWin,
  estimatedProfitRateIfWin,
}: EstimatedOutcomeProps) {
  // CONFIRMED라도 예상 필드가 아직 없으면(null) 확인 중으로 둔다.
  if (estimatedProfitIfWin === null || estimatedProfitIfWin === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        예상 정산 정보를 확인 중입니다.
      </p>
    );
  }

  const isPositiveProfit = toDecimal(estimatedProfitIfWin).greaterThan(0);

  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {MARKET_LABELS.estimatedProfitIfWin}
          </p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-2xl font-medium tabular-nums",
                isPositiveProfit ? "text-green-600" : "text-muted-foreground",
              )}
            >
              {formatSignedPoint(estimatedProfitIfWin)}
            </span>
            {estimatedProfitRateIfWin !== null &&
              estimatedProfitRateIfWin !== undefined && (
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    isPositiveProfit
                      ? "text-green-600"
                      : "text-muted-foreground",
                  )}
                >
                  ({formatSignedPercentValue(estimatedProfitRateIfWin)})
                </span>
              )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted-foreground">
            {MARKET_LABELS.estimatedPayoutIfWin}
          </p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
            {estimatedPayoutIfWin
              ? formatPointAmount(estimatedPayoutIfWin, 2)
              : "확인 중"}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        적중 시 예상치이며, 다른 참여자 참여와 정산 결과에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
