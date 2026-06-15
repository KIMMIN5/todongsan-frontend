import { formatDateTime } from "@/shared/lib/formatDate";
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
};

export function MyMarketPredictionCard({
  prediction,
  selectedOptionLabel,
}: MyMarketPredictionCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>내 예측 상태</CardTitle>
          <PredictionStatusBadge status={prediction.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <InfoRow
          label="선택지"
          value={selectedOptionLabel ?? `옵션 #${prediction.selectedOptionId}`}
        />
        <InfoRow
          label="참여 포인트"
          value={formatPointAmount(prediction.pointAmount)}
        />
        <InfoRow
          label="체결 가격"
          value={
            prediction.priceSnapshot
              ? formatPercent(prediction.priceSnapshot)
              : "처리 중"
          }
        />
        <InfoRow
          label="계약 수량"
          value={
            prediction.contractQuantity
              ? formatMarketPrice(prediction.contractQuantity)
              : "처리 중"
          }
        />
        <InfoRow label="생성 시각" value={formatDateTime(prediction.createdAt)} />
        <InfoRow label="갱신 시각" value={formatDateTime(prediction.updatedAt)} />
      </CardContent>
    </Card>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
