import type { ComponentProps } from "react";

import { Badge } from "@/shared/ui/badge";

import type { InsightReportStatus } from "../model/insight.types";

type InsightReportStatusBadgeProps = {
  status: InsightReportStatus;
};

const statusLabel: Record<InsightReportStatus, string> = {
  PENDING: "분석 대기",
  PROCESSING: "분석 중",
  DONE: "분석 완료",
  FAILED: "분석 실패",
};

const statusVariant: Record<
  InsightReportStatus,
  ComponentProps<typeof Badge>["variant"]
> = {
  PENDING: "warning",
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

export function InsightReportStatusBadge({
  status,
}: InsightReportStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
  );
}
