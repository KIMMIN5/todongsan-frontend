import type { ComponentProps } from "react";

import { Badge } from "@/shared/ui/badge";

import type { BattleStatus } from "../model/battle.types";

type BattleStatusBadgeProps = {
  status: BattleStatus;
  /** 정산 완료 여부 (status는 CLOSED 유지, settledAt으로 판단) */
  settled?: boolean;
};

const statusLabel: Record<BattleStatus, string> = {
  PENDING: "검수 대기",
  ACTIVE: "투표 진행 중",
  CLOSED: "투표 종료",
  CANCELLED: "취소됨",
};

const statusVariant: Record<
  BattleStatus,
  ComponentProps<typeof Badge>["variant"]
> = {
  PENDING: "warning",
  ACTIVE: "success",
  CLOSED: "info",
  CANCELLED: "danger",
};

export function BattleStatusBadge({ status, settled }: BattleStatusBadgeProps) {
  if (status === "CLOSED" && settled) {
    return <Badge variant="neutral">정산 완료</Badge>;
  }

  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}
