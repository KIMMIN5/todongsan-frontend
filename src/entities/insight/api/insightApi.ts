import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  InsightReport,
  InsightReportStatusInfo,
} from "../model/insight.types";

// 백엔드가 reportContent 필드로 반환하는 것을 프론트 타입의 content로 정규화
function normalizeReport(raw: InsightReport & { reportContent?: string }): InsightReport {
  return {
    ...raw,
    content: raw.content ?? raw.reportContent,
  };
}

export async function createMarketInsightReport(
  marketId: number,
  idempotencyKey: string,
): Promise<InsightReport> {
  const response = await httpClient.post<ApiResponse<InsightReport>>(
    `/api/v1/insights/markets/${marketId}/report`,
    {},
    { headers: { "Idempotency-Key": idempotencyKey } },
  );

  return normalizeReport(response.data.data);
}

export async function getMarketInsightReport(
  marketId: number,
): Promise<InsightReport> {
  const response = await httpClient.get<ApiResponse<InsightReport>>(
    `/api/v1/insights/markets/${marketId}/report`,
  );

  return normalizeReport(response.data.data);
}

export async function getMarketInsightReportStatus(
  marketId: number,
): Promise<InsightReportStatusInfo> {
  const response = await httpClient.get<ApiResponse<InsightReportStatusInfo>>(
    `/api/v1/insights/markets/${marketId}/report/status`,
  );

  return response.data.data;
}

export async function getAdminBattleInsightReport(
  battleId: number,
): Promise<InsightReport> {
  const response = await httpClient.get<ApiResponse<InsightReport>>(
    `/api/v1/admin/insights/battles/${battleId}/report`,
  );

  return normalizeReport(response.data.data);
}

// ── 사용자 배틀 AI 리포트 ──────────────────────────────────────────

export async function createBattleInsightReport(
  battleId: number,
  idempotencyKey: string,
): Promise<InsightReport> {
  const response = await httpClient.post<ApiResponse<InsightReport>>(
    `/api/v1/insights/battles/${battleId}/report`,
    {},
    { headers: { "Idempotency-Key": idempotencyKey } },
  );

  return normalizeReport(response.data.data);
}

export async function getBattleInsightReport(
  battleId: number,
): Promise<InsightReport> {
  const response = await httpClient.get<ApiResponse<InsightReport>>(
    `/api/v1/insights/battles/${battleId}/report`,
  );

  return normalizeReport(response.data.data);
}

export async function getBattleInsightReportStatus(
  battleId: number,
): Promise<InsightReportStatusInfo> {
  const response = await httpClient.get<ApiResponse<InsightReportStatusInfo>>(
    `/api/v1/insights/battles/${battleId}/report/status`,
  );

  return response.data.data;
}
