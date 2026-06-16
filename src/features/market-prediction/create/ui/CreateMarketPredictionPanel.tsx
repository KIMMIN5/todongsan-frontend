import { useQueryClient } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { useAuthStore } from "@/entities/auth/model/auth.store";
import { marketKeys } from "@/entities/market/model/market.keys";
import type {
  MarketOption,
  MarketPredictionQuoteResponse,
  MarketStatus,
} from "@/entities/market/model/market.types";
import { useMarketPredictionQuoteMutation } from "@/entities/market/model/useMarketPredictionQuoteMutation";
import { predictionKeys } from "@/entities/prediction/model/prediction.keys";
import type { CreateMarketPredictionResponse } from "@/entities/prediction/model/prediction.types";
import { useCreateMarketPredictionMutation } from "@/entities/prediction/model/useCreateMarketPredictionMutation";
import { useMyMarketPredictionQuery } from "@/entities/prediction/model/useMyMarketPredictionQuery";
import { isApiError } from "@/shared/api/apiError";
import {
  formatMarketPrice,
  formatPercent,
  formatPointAmount,
} from "@/shared/lib/formatDecimal";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

type Props = {
  marketId: number;
  options: MarketOption[];
  marketStatus: MarketStatus;
};

const POINT_AMOUNT_PATTERN = /^(?!0+(?:\.0{1,2})?$)\d+(?:\.\d{1,2})?$/;
const DEFAULT_NOTICE =
  "현재 가격은 실시간으로 변동될 수 있으며, 실제 참여 시점의 가격 기준으로 계약 수량이 확정됩니다.";

export function CreateMarketPredictionPanel({
  marketId,
  options,
  marketStatus,
}: Props) {
  const queryClient = useQueryClient();

  const authMemberId = useAuthStore((state) => state.memberId);
  const resolvedMemberId: number | string | null =
    authMemberId ??
    (import.meta.env.DEV && import.meta.env.VITE_DEV_MEMBER_ID
      ? import.meta.env.VITE_DEV_MEMBER_ID
      : null);

  const hasMemberId = resolvedMemberId !== null;
  const isMarketActive = marketStatus === "ACTIVE";
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
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  const quoteMutation = useMarketPredictionQuoteMutation();
  const createMutation = useCreateMarketPredictionMutation();

  const isQuoteFormDisabled = !isMarketActive || !hasOptions;
  const disabledMessage = !isMarketActive
    ? "ACTIVE 상태의 마켓에서만 예측에 참여할 수 있습니다."
    : !hasOptions
      ? "선택지가 없어 예측에 참여할 수 없습니다."
      : null;

  const handlePointAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPointAmount(event.target.value);
    setValidationMessage(null);
    quoteMutation.reset();
    createMutation.reset();
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
    setValidationMessage(null);
    quoteMutation.reset();
    createMutation.reset();
  };

  const handleQuoteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isQuoteFormDisabled) return;

    if (selectedOptionId === undefined) {
      setValidationMessage("선택지를 먼저 선택해 주세요.");
      return;
    }

    const trimmedAmount = pointAmount.trim();
    if (!POINT_AMOUNT_PATTERN.test(trimmedAmount)) {
      setValidationMessage(
        "포인트 금액은 0보다 큰 숫자로 입력해 주세요. 소수점은 둘째 자리까지만 허용됩니다.",
      );
      return;
    }

    setValidationMessage(null);
    quoteMutation.mutate({
      marketId,
      request: {
        marketOptionId: selectedOptionId,
        pointAmount: trimmedAmount,
      },
    });
  };

  const handlePredict = () => {
    if (!resolvedMemberId || selectedOptionId === undefined || !quoteMutation.data) return;

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
            queryKey: marketKeys.all,
          });
        },
        onError: (error, variables) => {
          if (isUncertainPredictionError(error)) {
            queryClient.invalidateQueries({
              queryKey: predictionKeys.myMarketPrediction(variables.marketId),
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

  const quoteErrorMessage = isApiError(quoteMutation.error)
    ? quoteMutation.error.message
    : quoteMutation.error instanceof Error
      ? quoteMutation.error.message
      : "Quote를 조회하는 중 문제가 발생했습니다.";

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>예측 참여</CardTitle>
          <Calculator className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          선택지와 포인트 금액을 입력한 뒤 Quote를 확인하고 예측에 참여합니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasMemberId && (
          <div className="rounded-lg border border-muted bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">
              예측에 참여하려면 로그인하거나 로컬 개발용 회원 ID(VITE_DEV_MEMBER_ID)를 설정해 주세요.
            </p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleQuoteSubmit}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">선택지</p>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Button
                  key={option.optionId}
                  type="button"
                  size="sm"
                  variant={
                    selectedOptionId === option.optionId ? "default" : "outline"
                  }
                  disabled={isQuoteFormDisabled || createMutation.isPending}
                  onClick={() => handleOptionSelect(option.optionId)}
                >
                  {option.content}
                </Button>
              ))}
            </div>
          </div>

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
              placeholder="예: 100.00"
              value={pointAmount}
              disabled={
                isQuoteFormDisabled ||
                quoteMutation.isPending ||
                createMutation.isPending
              }
              aria-invalid={validationMessage ? true : undefined}
              onChange={handlePointAmountChange}
            />
            {validationMessage && (
              <p className="text-xs text-destructive">{validationMessage}</p>
            )}
            {disabledMessage && (
              <p className="text-xs text-muted-foreground">{disabledMessage}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="outline"
            disabled={isQuoteFormDisabled || quoteMutation.isPending || createMutation.isPending}
          >
            {quoteMutation.isPending ? "조회 중" : "Quote 조회"}
          </Button>
        </form>

        {quoteMutation.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive">
              Quote를 불러오지 못했습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {quoteErrorMessage}
            </p>
          </div>
        )}

        {quoteMutation.data && (
          <QuoteResult data={quoteMutation.data} />
        )}

        {hasPrediction && (
          <div className="rounded-lg border border-muted bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">
              이미 이 마켓에 참여했습니다.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              내 예측 상태 카드에서 결과를 확인하세요.
            </p>
          </div>
        )}

        {isMyPredictionChecking && (
          <p className="text-xs text-muted-foreground">
            기존 참여 여부를 확인 중입니다.
          </p>
        )}

        {!hasPrediction && quoteMutation.data && (
          <Button
            type="button"
            disabled={isPredictButtonDisabled}
            onClick={handlePredict}
          >
            {createMutation.isPending ? "참여 중..." : "예측 참여하기"}
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

type QuoteResultProps = {
  data: MarketPredictionQuoteResponse;
};

function QuoteResult({ data }: QuoteResultProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <QuoteRow label="요청 포인트" value={formatPointAmount(data.pointAmount)} />
        <QuoteRow label="현재 가격" value={formatPercent(data.currentPrice)} />
        <QuoteRow
          label="예상 계약 수량"
          value={formatMarketPrice(data.estimatedContractQuantity)}
        />
        <QuoteRow
          label="예상 참여 후 가격"
          value={formatPercent(data.estimatedAfterPrice)}
        />
        <QuoteRow
          label="가격 영향도"
          value={formatPercentPoint(data.priceImpactRate)}
        />
        <QuoteRow
          label="선택지 유효 풀"
          value={`${formatPointAmount(data.selectedOptionEffectivePoolBefore)} → ${formatPointAmount(data.selectedOptionEffectivePoolAfter)}`}
        />
      </div>
      <p className="mt-4 rounded-md bg-background p-3 text-xs text-muted-foreground">
        {data.notice || DEFAULT_NOTICE}
      </p>
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
          예측 참여가 완료되었습니다.
        </p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          내 예측 상태 카드에서 결과를 확인하세요.
        </p>
      </div>
    );
  }

  if (status === "POINT_PENDING") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
          예측 참여 처리 중입니다.
        </p>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          잠시 후 내 예측 상태 카드에서 결과가 반영됩니다.
        </p>
      </div>
    );
  }

  if (status === "POINT_UNKNOWN") {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
          예측 참여 처리 상태를 확인 중입니다.
        </p>
        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
          잠시 후 결과가 반영될 수 있습니다. 내 예측 상태 카드를 확인해 주세요.
        </p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-destructive">
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
  MARKET_CLOSED: "이미 마감된 마켓입니다.",
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
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
          처리 상태 확인 중
        </p>
        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-destructive">
        예측 참여 실패
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

type QuoteRowProps = {
  label: string;
  value: string;
};

function QuoteRow({ label, value }: QuoteRowProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatPercentPoint(value: string | null | undefined): string {
  const formatted = formatMarketPrice(value);
  return formatted === "-" ? "-" : `${formatted}%`;
}

function isUncertainPredictionError(error: unknown): boolean {
  if (isApiError(error)) {
    return (
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504 ||
      error.errorCode === "EXTERNAL_SERVICE_TIMEOUT" ||
      error.errorCode === "EXTERNAL_SERVICE_UNAVAILABLE" ||
      error.errorCode === "EXTERNAL_SERVICE_ERROR"
    );
  }
  return false;
}
