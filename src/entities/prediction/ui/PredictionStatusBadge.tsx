import type { ComponentProps } from "react";

import { Badge } from "@/shared/ui/badge";

import type { PredictionStatus } from "../model/prediction.types";

type PredictionStatusBadgeProps = {
  status: PredictionStatus;
};

const statusLabel: Record<PredictionStatus, string> = {
  POINT_PENDING: "처리 중",
  POINT_UNKNOWN: "확인 중",
  CONFIRMED: "참여 완료",
  FAILED: "참여 실패",
  SETTLED: "정산 완료",
  REFUND_PENDING: "환불 처리 중",
  REFUND_UNKNOWN: "환불 확인 중",
  REFUNDED: "환불 완료",
};

const statusVariant: Record<
  PredictionStatus,
  ComponentProps<typeof Badge>["variant"]
> = {
  POINT_PENDING: "warning",
  POINT_UNKNOWN: "warning",
  CONFIRMED: "success",
  FAILED: "danger",
  SETTLED: "neutral",
  REFUND_PENDING: "violet",
  REFUND_UNKNOWN: "violet",
  REFUNDED: "info",
};

export function PredictionStatusBadge({ status }: PredictionStatusBadgeProps) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}
