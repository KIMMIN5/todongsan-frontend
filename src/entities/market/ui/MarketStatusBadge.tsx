import type { ComponentProps } from "react";

import { Badge } from "@/shared/ui/badge";

import type { MarketDisplayStatus } from "../model/market.types";

type MarketStatusBadgeProps = {
  displayStatus: MarketDisplayStatus;
};

const statusLabel: Record<MarketDisplayStatus, string> = {
  PENDING: "검수 대기",
  ACTIVE: "진행 중",
  CLOSED_BY_TIME: "마감",
  CLOSED: "결과 확정",
  DATA_PENDING: "데이터 대기",
  SETTLEMENT_IN_PROGRESS: "정산 중",
  SETTLED: "정산 완료",
  VOIDED: "무효",
};

const statusVariant: Record<
  MarketDisplayStatus,
  ComponentProps<typeof Badge>["variant"]
> = {
  PENDING: "warning",
  ACTIVE: "success",
  CLOSED_BY_TIME: "neutral",
  CLOSED: "info",
  DATA_PENDING: "warning",
  SETTLEMENT_IN_PROGRESS: "violet",
  SETTLED: "neutral",
  VOIDED: "danger",
};

export function MarketStatusBadge({ displayStatus }: MarketStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[displayStatus]}>
      {statusLabel[displayStatus]}
    </Badge>
  );
}
