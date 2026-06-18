import { useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useEffect, useState } from "react";

import { useAuthStore } from "@/entities/auth/model/auth.store";
import { marketKeys } from "@/entities/market/model/market.keys";
import type {
  MarketDisplayStatus,
  MarketOption,
  MarketPredictionQuoteResponse,
} from "@/entities/market/model/market.types";
import { getOptionColorMap } from "@/entities/market/lib/optionColor";
import { useMarketPredictionQuoteMutation } from "@/entities/market/model/useMarketPredictionQuoteMutation";
import { predictionKeys } from "@/entities/prediction/model/prediction.keys";
import type { CreateMarketPredictionResponse } from "@/entities/prediction/model/prediction.types";
import { useCreateMarketPredictionMutation } from "@/entities/prediction/model/useCreateMarketPredictionMutation";
import { useMyMarketPredictionQuery } from "@/entities/prediction/model/useMyMarketPredictionQuery";
import { isApiError } from "@/shared/api/apiError";
import { toDecimal } from "@/shared/lib/decimal";
import { formatMarketPrice, formatPercent } from "@/shared/lib/formatDecimal";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type Props = {
  marketId: number;
  options: MarketOption[];
  canPredict: boolean;
  displayStatus: MarketDisplayStatus;
};

const POINT_AMOUNT_PATTERN = /^(?!0+(?:\.0{1,2})?$)\d+(?:\.\d{1,2})?$/;
const QUICK_ADD_AMOUNTS = [10, 50, 100];

export function CreateMarketPredictionPanel({
  marketId,
  options,
  canPredict,
  displayStatus,
}: Props) {
  const queryClient = useQueryClient();

  const authMemberId = useAuthStore((state) => state.memberId);
  const resolvedMemberId: number | string | null =
    authMemberId ??
    (import.meta.env.DEV && import.meta.env.VITE_DEV_MEMBER_ID
      ? import.meta.env.VITE_DEV_MEMBER_ID
      : null);

  const hasMemberId = resolvedMemberId !== null;
  const isMarketActive = canPredict;
  const hasOptions = options.length > 0;

  const myPredictionQuery = useMyMarketPredictionQuery(marketId, {
    enabled: hasMemberId,
  });
  const hasPrediction =
    myPredictionQuery.data !== undefined &&
    myPredictionQuery.data !== null &&
    myPredictionQuery.data.status !== undefined;
  const isMyPredictionChecking =
    hasMemberId &&
    (myPredictionQuery.isLoading || myPredictionQuery.isFetching);

  const [selectedOptionId, setSelectedOptionId] = useState<number | undefined>(
    options[0]?.optionId,
  );
  const [pointAmount, setPointAmount] = useState("");

  const quoteMutation = useMarketPredictionQuoteMutation();
  const createMutation = useCreateMarketPredictionMutation();
  const quoteMutate = quoteMutation.mutate;
  const quoteReset = quoteMutation.reset;

  const isQuoteFormDisabled = !isMarketActive || !hasOptions;
  const disabledMessage = !isMarketActive
    ? displayStatus === "CLOSED_BY_TIME"
      ? "마감 시간이 지나 예측에 참여할 수 없습니다."
      : "현재 예측 참여가 불가능한 상태입니다."
    : !hasOptions
      ? "선택지가 없어 예측에 참여할 수 없습니다."
      : null;

  const trimmedAmount = pointAmount.trim();
  const isAmountValid = POINT_AMOUNT_PATTERN.test(trimmedAmount);
  const showAmountError = trimmedAmount !== "" && !isAmountValid;

  // 옵션 색은 작업 0의 단일 소스(optionId 고정)를 사용해 막대/차트/최신가와 일치시킨다.
  const optionColorMap = getOptionColorMap(
    options.map((option) => option.optionId),
  );

  // 자동 견적: 유효한 포인트가 입력되면 디바운스 후 Quote를 조회한다.
  useEffect(() => {
    if (isQuoteFormDisabled || selectedOptionId === undefined || !isAmountValid) {
      quoteReset();
      return;
    }

    const timer = setTimeout(() => {
      quoteMutate(
        {
          marketId,
          request: {
            marketOptionId: selectedOptionId,
            pointAmount: trimmedAmount,
          },
        },
        {
          onError: (error) => {
            if (isApiError(error) && error.errorCode === "MARKET_CLOSED") {
              queryClient.invalidateQueries({
                queryKey: marketKeys.detail(marketId),
              });
            }
          },
        },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [
    trimmedAmount,
    isAmountValid,
    selectedOptionId,
    isQuoteFormDisabled,
    marketId,
    quoteMutate,
    quoteReset,
    queryClient,
  ]);

  const handlePointAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPointAmount(event.target.value);
    createMutation.reset();
  };

  const handleQuickAdd = (amount: number) => {
    setPointAmount((prev) => toDecimal(prev || "0").plus(amount).toString());
    createMutation.reset();
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
    createMutation.reset();
  };

  const handlePredict = () => {
    if (!resolvedMemberId || selectedOptionId === undefined || !quoteMutation.data)
      return;

    createMutation.mutate(
      {
        marketId,
        memberId: resolvedMemberId,
        request: {
          marketOptionId: selectedOptionId,
          pointAmount: pointAmount.trim(),
        },
      },
      {
        onSuccess: (_data, variables) => {
          queryClient.invalidateQueries({
            queryKey: predictionKeys.myMarketPrediction(variables.marketId),
          });
          queryClient.invalidateQueries({
            queryKey: predictionKeys.myLists(),
          });
          queryClient.invalidateQueries({
            queryKey: marketKeys.detail(variables.marketId),
          });
          queryClient.invalidateQueries({
            queryKey: marketKeys.priceHistoryRoot(variables.marketId),
          });
          queryClient.invalidateQueries({
            queryKey: marketKeys.lists(),
          });
        },
        onError: (error, variables) => {
          if (shouldInvalidateMyPredictionOnCreateError(error)) {
            queryClient.invalidateQueries({
              queryKey: predictionKeys.myMarketPrediction(variables.marketId),
            });
          }
          if (isApiError(error) && error.errorCode === "MARKET_CLOSED") {
            queryClient.invalidateQueries({
              queryKey: marketKeys.detail(variables.marketId),
            });
          }
        },
      },
    );
  };

  const isPredictButtonDisabled =
    !isMarketActive ||
    !hasMemberId ||
    isMyPredictionChecking ||
    selectedOptionId === undefined ||
    !quoteMutation.data ||
    createMutation.isPending ||
    hasPrediction;

  const quoteErrorMessage =
    isApiError(quoteMutation.error) &&
    quoteMutation.error.errorCode === "MARKET_CLOSED"
      ? "마감 시간이 지나 예측에 참여할 수 없습니다."
      : isApiError(quoteMutation.error)
        ? quoteMutation.error.message
        : quoteMutation.error instanceof Error
          ? quoteMutation.error.message
          : "예상 결과를 계산하는 중 문제가 발생했습니다.";

  return (
    <Card>
      <CardHeader className="gap-1.5">
        <CardTitle className="font-medium">예측 참여</CardTitle>
        {!disabledMessage && (
          <p className="text-sm text-muted-foreground">
            선택지와 참여 포인트를 입력하면 예상 결과를 바로 확인할 수 있습니다.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasMemberId && (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-sm text-muted-foreground">
              예측에 참여하려면 로그인하거나 로컬 개발용 회원 ID(VITE_DEV_MEMBER_ID)를 설정해 주세요.
            </p>
          </div>
        )}

        {/* 선택지 */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">선택지</p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => {
              const color = optionColorMap[option.optionId];
              const selected = selectedOptionId === option.optionId;

              return (
                <button
                  key={option.optionId}
                  type="button"
                  disabled={isQuoteFormDisabled || createMutation.isPending}
                  onClick={() => handleOptionSelect(option.optionId)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    selected ? "" : "border-border hover:bg-muted/40",
                  )}
                  style={
                    selected
                      ? {
                          borderColor: color?.base,
                          backgroundColor: `${color?.base}1a`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color?.base }}
                      />
                      <span className="truncate text-sm font-medium text-foreground">
                        {option.content}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                      {formatPercent(option.currentPrice)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 참여 포인트 */}
        <div className="space-y-2">
          <label
            htmlFor="create-prediction-point-amount"
            className="text-sm font-medium text-foreground"
          >
            참여 포인트
          </label>
          <Input
            id="create-prediction-point-amount"
            inputMode="decimal"
            placeholder="예: 100"
            value={pointAmount}
            disabled={isQuoteFormDisabled || createMutation.isPending}
            aria-invalid={showAmountError ? true : undefined}
            onChange={handlePointAmountChange}
          />
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ADD_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                disabled={isQuoteFormDisabled || createMutation.isPending}
                onClick={() => handleQuickAdd(amount)}
              >
                +{amount}
              </Button>
            ))}
          </div>
          {showAmountError && (
            <p className="text-xs text-destructive">
              0보다 큰 숫자로 입력해 주세요. 소수점은 둘째 자리까지 가능합니다.
            </p>
          )}
          {disabledMessage && (
            <p className="text-xs text-muted-foreground">{disabledMessage}</p>
          )}
        </div>

        {/* 예상 결과 미리보기 */}
        {quoteMutation.isPending && (
          <p className="text-xs text-muted-foreground">예상 결과 계산 중…</p>
        )}

        {quoteMutation.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">
              예상 결과를 불러오지 못했습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {quoteErrorMessage}
            </p>
          </div>
        )}

        {quoteMutation.data && !quoteMutation.isPending && (
          <QuotePreview data={quoteMutation.data} />
        )}

        {hasPrediction && (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-sm font-medium text-foreground">
              이미 이 마켓에 참여했습니다.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              아래 "내 예측"에서 결과를 확인하세요.
            </p>
          </div>
        )}

        {isMyPredictionChecking && (
          <p className="text-xs text-muted-foreground">
            기존 참여 여부를 확인 중입니다.
          </p>
        )}

        {/* CTA */}
        {!hasPrediction && (
          <Button
            type="button"
            className="w-full bg-green-600 font-medium text-white hover:bg-green-700"
            disabled={isPredictButtonDisabled}
            onClick={handlePredict}
          >
            {createMutation.isPending ? "참여 중…" : "예측 참여하기"}
          </Button>
        )}

        {createMutation.isSuccess && (
          <PredictionSuccessMessage data={createMutation.data} />
        )}

        {createMutation.isError && (
          <PredictionErrorMessage error={createMutation.error} />
        )}
      </CardContent>
    </Card>
  );
}

type QuotePreviewProps = {
  data: MarketPredictionQuoteResponse;
};

function QuotePreview({ data }: QuotePreviewProps) {
  return (
    <div className="space-y-2 rounded-lg bg-muted/40 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">예상 체결가</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatPercent(data.currentPrice)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">예상 계약 수량</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatMarketPrice(data.estimatedContractQuantity, 2)}계약
        </span>
      </div>
      <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
        계약 수량은 정산 시 분배 비율을 계산하는 기준입니다. 실제 수령 포인트는
        최종 참여 풀과 정산 결과에 따라 달라집니다.
      </p>
      {data.notice ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {data.notice}
        </p>
      ) : null}
    </div>
  );
}

type PredictionSuccessMessageProps = {
  data: CreateMarketPredictionResponse;
};

function PredictionSuccessMessage({ data }: PredictionSuccessMessageProps) {
  const { status } = data;

  if (status === "CONFIRMED") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          예측 참여가 완료되었습니다.
        </p>
        <p className="mt-1 text-sm text-green-700">
          아래 "내 예측"에서 결과를 확인하세요.
        </p>
      </div>
    );
  }

  if (status === "POINT_PENDING") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-800">
          예측 참여 처리 중입니다.
        </p>
        <p className="mt-1 text-sm text-blue-700">
          잠시 후 "내 예측"에 결과가 반영됩니다.
        </p>
      </div>
    );
  }

  if (status === "POINT_UNKNOWN") {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">
          예측 참여 처리 상태를 확인 중입니다.
        </p>
        <p className="mt-1 text-sm text-yellow-700">
          잠시 후 결과가 반영될 수 있습니다. "내 예측"을 확인해 주세요.
        </p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-destructive">
          예측 참여에 실패했습니다.
        </p>
      </div>
    );
  }

  return null;
}

const PREDICTION_ERROR_MESSAGES: Record<string, string> = {
  MARKET_NOT_FOUND: "마켓을 찾을 수 없습니다.",
  MARKET_NOT_ACTIVE: "현재 참여할 수 없는 마켓입니다.",
  MARKET_CLOSED: "마감 시간이 지나 예측에 참여할 수 없습니다.",
  MARKET_ALREADY_PREDICTED: "이미 이 마켓에 참여했습니다.",
  MARKET_OPTION_NOT_FOUND: "선택지를 찾을 수 없습니다.",
  MARKET_INVALID_BET_AMOUNT: "예측 참여 금액을 확인해 주세요.",
  POINT_INSUFFICIENT: "포인트가 부족합니다.",
  MEMBER_ALREADY_DELETED: "탈퇴한 회원은 예측에 참여할 수 없습니다.",
  IDEMPOTENCY_KEY_REQUIRED:
    "요청 식별 키가 누락되었습니다. 다시 시도해 주세요.",
  IDEMPOTENCY_KEY_CONFLICT:
    "이전 요청과 다른 내용의 중복 요청입니다. 새로고침 후 다시 시도해 주세요.",
  EXTERNAL_SERVICE_TIMEOUT:
    "예측 참여 처리 상태를 확인 중입니다. 잠시 후 결과가 반영될 수 있습니다.",
  EXTERNAL_SERVICE_UNAVAILABLE:
    "포인트 서비스 연결이 원활하지 않습니다. 잠시 후 다시 확인해 주세요.",
  EXTERNAL_SERVICE_ERROR: "포인트 서비스 처리 중 문제가 발생했습니다.",
  MARKET_PRICE_UPDATE_CONFLICT:
    "동시에 참여 요청이 많아 가격 갱신에 실패했습니다. 다시 시도해 주세요.",
};

type PredictionErrorMessageProps = {
  error: unknown;
};

function PredictionErrorMessage({ error }: PredictionErrorMessageProps) {
  let message = "예측 참여 중 문제가 발생했습니다. 다시 시도해 주세요.";
  let isUncertain = false;

  if (isApiError(error)) {
    const mapped = PREDICTION_ERROR_MESSAGES[error.errorCode];
    if (mapped) {
      message = mapped;
    } else if (error.status !== undefined && error.status >= 500) {
      message =
        "예측 참여 처리 상태를 확인 중입니다. 잠시 후 결과가 반영될 수 있습니다.";
      isUncertain = true;
    } else {
      message = error.message || message;
    }

    if (
      error.errorCode === "EXTERNAL_SERVICE_TIMEOUT" ||
      error.errorCode === "EXTERNAL_SERVICE_UNAVAILABLE" ||
      error.errorCode === "EXTERNAL_SERVICE_ERROR"
    ) {
      isUncertain = true;
    }
  } else if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number" &&
    (error as { status: number }).status >= 500
  ) {
    message =
      "예측 참여 처리 상태를 확인 중입니다. 잠시 후 결과가 반영될 수 있습니다.";
    isUncertain = true;
  }

  if (isUncertain) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">처리 상태 확인 중</p>
        <p className="mt-1 text-sm text-yellow-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <p className="text-sm font-medium text-destructive">예측 참여 실패</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function shouldInvalidateMyPredictionOnCreateError(error: unknown): boolean {
  if (isApiError(error)) {
    return (
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504 ||
      error.errorCode === "EXTERNAL_SERVICE_TIMEOUT" ||
      error.errorCode === "EXTERNAL_SERVICE_UNAVAILABLE" ||
      error.errorCode === "EXTERNAL_SERVICE_ERROR" ||
      error.errorCode === "MARKET_ALREADY_PREDICTED"
    );
  }
  return false;
}
