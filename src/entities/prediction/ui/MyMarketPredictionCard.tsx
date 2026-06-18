import type {
  MarketDisplayStatus,
  MarketStatus,
} from "@/entities/market/model/market.types";
import {
  formatMarketPrice,
  formatPercent,
  formatPointAmount,
} from "@/shared/lib/formatDecimal";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { MyMarketPrediction } from "../model/prediction.types";
import { PredictionStatusBadge } from "./PredictionStatusBadge";

type MyMarketPredictionCardProps = {
  prediction: MyMarketPrediction;
  selectedOptionLabel?: string;
  marketStatus?: MarketStatus;
  marketDisplayStatus?: MarketDisplayStatus;
};

export function MyMarketPredictionCard({
  prediction,
  selectedOptionLabel,
  marketStatus,
  marketDisplayStatus,
}: MyMarketPredictionCardProps) {
  const optionLabel =
    selectedOptionLabel ?? `옵션 ${prediction.selectedOptionId}`;

  // 체결가/수량은 실제 값이 있을 때만 묶어서 표시한다.
  // 계약 수량은 포인트가 아니므로 P 단위를 붙이지 않고 "계약"으로 표기한다.
  const fillValue =
    prediction.priceSnapshot && prediction.contractQuantity
      ? `${formatPercent(prediction.priceSnapshot)} · ${formatMarketPrice(prediction.contractQuantity, 2)}계약`
      : "체결 정보 대기";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-medium">내 예측</CardTitle>
          <PredictionStatusBadge
            status={prediction.status}
            marketStatus={marketStatus}
            marketDisplayStatus={marketDisplayStatus}
          />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Metric
          label="선택 · 참여"
          value={`${optionLabel} · ${formatPointAmount(prediction.pointAmount)}`}
        />
        <Metric label="체결가 · 수량" value={fillValue} />
      </CardContent>
    </Card>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
