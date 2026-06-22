import type { badgeVariants } from "@/shared/ui/badge";
import type { VariantProps } from "class-variance-authority";

import type { MarketDisplayStatus } from "../model/market.types";

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const DISPLAY_STATUS_BADGE: Record<
  MarketDisplayStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "대기", variant: "secondary" },
  ACTIVE: { label: "진행 중", variant: "success" },
  CLOSED_BY_TIME: { label: "결과 대기", variant: "warning" },
  DATA_PENDING: { label: "데이터 대기", variant: "warning" },
  CLOSED: { label: "정산 대기", variant: "info" },
  SETTLEMENT_IN_PROGRESS: { label: "정산 중", variant: "violet" },
  SETTLED: { label: "정산 완료", variant: "secondary" },
  VOIDED: { label: "무효", variant: "secondary" },
};
