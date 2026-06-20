import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Calculator } from "lucide-react";

import { isApiError } from "@/shared/api/apiError";
import {
  formatMarketPrice,
  formatPercent,
  formatPointAmount,
} from "@/shared/lib/formatDecimal";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { useMarketPredictionQuoteMutation } from "../model/useMarketPredictionQuoteMutation";
import type {
  MarketDisplayStatus,
  MarketOption,
  MarketPredictionQuoteResponse,
} from "../model/market.types";

type MarketPredictionQuotePanelProps = {
  marketId: number;
  options: MarketOption[];
  canPredict: boolean;
  displayStatus: MarketDisplayStatus;
};

const POINT_AMOUNT_PATTERN = /^(?!0+(?:\.0{1,2})?$)\d+(?:\.\d{1,2})?$/;
const DEFAULT_NOTICE =
  "현재 가격은 실시간으로 변동될 수 있으며, 실제 참여 시점의 가격 기준으로 계약 수량이 확정됩니다.";

export function MarketPredictionQuotePanel({
  marketId,
  options,
  canPredict,
  displayStatus,
}: MarketPredictionQuotePanelProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | undefined>(
    options[0]?.optionId,
  );
  const [pointAmount, setPointAmount] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const quoteMutation = useMarketPredictionQuoteMutation();

  const isQuoteDisabled = !canPredict || options.length === 0;
  const disabledMessage = !canPredict
    ? displayStatus === "CLOSED_BY_TIME"
      ? "마감 시간이 지나 예측에 참여할 수 없습니다."
      : "현재 예측 참여가 불가능한 상태입니다."
    : options.length === 0
    ? "선택지가 없어 Quote를 조회할 수 없습니다."
    : null;

  const handlePointAmountChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPointAmount(event.target.value);
    setValidationMessage(null);
    quoteMutation.reset();
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
    setValidationMessage(null);
    quoteMutation.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isQuoteDisabled) return;

    if (selectedOptionId === undefined) {
      setValidationMessage("선택지를 먼저 선택해 주세요.");
      return;
    }

    const trimmedPointAmount = pointAmount.trim();
    if (!POINT_AMOUNT_PATTERN.test(trimmedPointAmount)) {
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
        pointAmount: trimmedPointAmount,
      },
    });
  };

  const errorMessage = isApiError(quoteMutation.error)
    ? quoteMutation.error.message
    : quoteMutation.error instanceof Error
    ? quoteMutation.error.message
    : "Quote를 조회하는 중 문제가 발생했습니다.";

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>예측 참여 미리보기</CardTitle>
          <Calculator className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          실제 예측 참여 전 예상 계약 수량과 참여 후 가격을 확인합니다.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">선택지</p>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Button
                  key={option.optionId}
                  type="button"
                  size="sm"
                  variant={
                    selectedOptionId === option.optionId
                      ? "default"
                      : "outline"
                  }
                  disabled={isQuoteDisabled}
                  onClick={() => handleOptionSelect(option.optionId)}
                >
                  {option.content}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="market-quote-point-amount"
              className="text-sm font-medium text-foreground"
            >
              참여 포인트
            </label>
            <Input
              id="market-quote-point-amount"
              inputMode="decimal"
              placeholder="예: 100.00"
              value={pointAmount}
              disabled={isQuoteDisabled || quoteMutation.isPending}
              aria-invalid={validationMessage ? true : undefined}
              onChange={handlePointAmountChange}
            />
            {validationMessage && (
              <p className="text-xs text-destructive">{validationMessage}</p>
            )}
            {disabledMessage && (
              <p className="text-xs text-muted-foreground">
                {disabledMessage}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isQuoteDisabled || quoteMutation.isPending}
          >
            {quoteMutation.isPending ? "조회 중" : "Quote 조회"}
          </Button>
        </form>

        {quoteMutation.isError && (
          <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive">
              Quote를 불러오지 못했습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage}
            </p>
          </div>
        )}

        {quoteMutation.data && (
          <QuoteResult data={quoteMutation.data} />
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
    <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
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
          value={`${formatPointAmount(
            data.selectedOptionEffectivePoolBefore,
          )} -> ${formatPointAmount(data.selectedOptionEffectivePoolAfter)}`}
        />
        <QuoteRow
          label="전체 유효 풀"
          value={`${formatPointAmount(
            data.totalEffectivePoolBefore,
          )} -> ${formatPointAmount(data.totalEffectivePoolAfter)}`}
        />
      </div>
      <p className="mt-4 rounded-md bg-background p-3 text-xs text-muted-foreground">
        {data.notice || DEFAULT_NOTICE}
      </p>
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
