import type { badgeVariants } from "@/shared/ui/badge";
import type { VariantProps } from "class-variance-authority";

import type {
  AdminMarketDetailItemStatus,
  AdminMarketRefundStatus,
  AdminMarketSettlementStatus,
} from "../model/market.types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/** 정산/환불 detail item(개별 prediction 단위) 상태 배지. */
export const DETAIL_ITEM_STATUS_BADGE: Record<
  AdminMarketDetailItemStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "대기", variant: "secondary" },
  SUCCESS: { label: "성공", variant: "success" },
  FAILED: { label: "실패", variant: "danger" },
  UNKNOWN: { label: "불명확", variant: "warning" },
};

/** 정산/환불 batch(settlement/refund row) 전체 상태 배지. 두 enum이 값을 공유한다. */
export const BATCH_STATUS_BADGE: Record<
  AdminMarketSettlementStatus | AdminMarketRefundStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "대기", variant: "secondary" },
  IN_PROGRESS: { label: "진행 중", variant: "violet" },
  COMPLETED: { label: "완료", variant: "success" },
  FAILED: { label: "실패", variant: "danger" },
};
