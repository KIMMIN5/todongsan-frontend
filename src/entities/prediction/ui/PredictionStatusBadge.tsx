import type { ComponentProps } from "react";

import type {
  MarketDisplayStatus,
  MarketStatus,
} from "@/entities/market/model/market.types";
import { Badge } from "@/shared/ui/badge";

import type { PredictionStatus } from "../model/prediction.types";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

type PredictionStatusBadgeProps = {
  status: PredictionStatus;
  /**
   * 마켓 상태를 함께 넘기면 CONFIRMED 예측을 마켓 진행 상황과 조합해 분기한다.
   * (예: 결과 확정 후 정산 전이면 "정산 대기")
   */
  marketStatus?: MarketStatus;
  marketDisplayStatus?: MarketDisplayStatus;
};

function resolveBadge(
  status: PredictionStatus,
  marketStatus?: MarketStatus,
  marketDisplayStatus?: MarketDisplayStatus,
): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "FAILED":
      return { label: "참여 실패", variant: "danger" };
    case "POINT_PENDING":
      return { label: "참여 처리 중", variant: "warning" };
    case "POINT_UNKNOWN":
      return { label: "참여 확인 중", variant: "warning" };
    case "SETTLED":
      return { label: "정산 완료", variant: "neutral" };
    case "REFUND_PENDING":
      return { label: "환불 처리 중", variant: "violet" };
    case "REFUND_UNKNOWN":
      return { label: "환불 확인 중", variant: "violet" };
    case "REFUNDED":
      return { label: "환불 완료", variant: "info" };
    case "CONFIRMED": {
      const isResultConfirmed =
        marketStatus === "CLOSED" ||
        marketStatus === "SETTLEMENT_IN_PROGRESS" ||
        marketDisplayStatus === "CLOSED" ||
        marketDisplayStatus === "SETTLEMENT_IN_PROGRESS";

      if (isResultConfirmed) {
        return { label: "정산 대기", variant: "info" };
      }
      if (marketDisplayStatus === "CLOSED_BY_TIME") {
        return { label: "마감 · 결과 대기", variant: "neutral" };
      }
      if (marketDisplayStatus === "ACTIVE") {
        return { label: "참여 완료 · 진행 중", variant: "success" };
      }
      return { label: "참여 완료", variant: "success" };
    }
    default:
      return { label: status, variant: "neutral" };
  }
}

export function PredictionStatusBadge({
  status,
  marketStatus,
  marketDisplayStatus,
}: PredictionStatusBadgeProps) {
  const { label, variant } = resolveBadge(
    status,
    marketStatus,
    marketDisplayStatus,
  );
  return <Badge variant={variant}>{label}</Badge>;
}
