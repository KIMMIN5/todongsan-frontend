import { useNavigate } from "react-router-dom";

import { formatDateTime } from "@/shared/lib/formatDate";
import {
  formatMarketPrice,
  formatPercent,
  formatPointAmount,
} from "@/shared/lib/formatDecimal";
import { Card, CardContent } from "@/shared/ui/card";
import { MarketStatusBadge } from "@/entities/market/ui/MarketStatusBadge";

import type { MyMarketPredictionListItem } from "@/entities/prediction/model/prediction.types";
import { PredictionStatusBadge } from "@/entities/prediction/ui/PredictionStatusBadge";

type MyMarketPredictionListCardProps = {
  item: MyMarketPredictionListItem;
};

export function MyMarketPredictionListCard({
  item,
}: MyMarketPredictionListCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => navigate(`/markets/${item.marketId}`)}
    >
      <CardContent className="py-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {item.marketTitle}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <MarketStatusBadge displayStatus={item.marketDisplayStatus} />
            <PredictionStatusBadge
              status={item.predictionStatus}
              marketStatus={item.marketStatus}
              marketDisplayStatus={item.marketDisplayStatus}
            />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
          <InfoRow label="선택" value={item.selectedOptionContent} />
          <InfoRow
            label="참여 포인트"
            value={formatPointAmount(item.pointAmount)}
          />
          <InfoRow
            label="체결 가격"
            value={
              item.priceSnapshot ? formatPercent(item.priceSnapshot) : "확인 중"
            }
          />
          <InfoRow
            label="계약 수량"
            value={
              item.contractQuantity
                ? `${formatMarketPrice(item.contractQuantity, 2)}계약`
                : "확인 중"
            }
          />
          <InfoRow label="마감" value={formatDateTime(item.closeAt)} />

          {item.settledAmount && (
            <InfoRow
              label="정산 금액"
              value={formatPointAmount(item.settledAmount)}
              highlight
            />
          )}
          {item.refundAmount && (
            <InfoRow
              label="환불 금액"
              value={formatPointAmount(item.refundAmount)}
              highlight
            />
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          highlight
            ? "mt-0.5 font-semibold text-emerald-600"
            : "mt-0.5 font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
