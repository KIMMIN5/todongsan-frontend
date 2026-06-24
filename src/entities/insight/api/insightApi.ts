import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  AdminActivityTrend,
  AdminInsightsOverview,
  AdminMarketDashboard,
  AdminMarketInsightPriceHistory,
  AdminRegionsPriceMap,
  InsightReport,
  InsightReportStatusInfo,
  MarketPublicDataReferenceResponse,
} from "../model/insight.types";

// Claude 출력이 "title: ...\n\nsummary: ...\n\ncontent: |\n  ..." 형식으로
// summary 필드에 통째로 들어오는 경우를 파싱
function parseClaudeOutput(raw: string): { title?: string; summary?: string; content?: string } {
  if (!raw.trimStart().startsWith('title:')) return {};

  const titleMatch = raw.match(/^title:\s*(.+?)(?:\n|$)/);
  const summaryMatch = raw.match(/(?:^|\n)summary:\s*([\s\S]+?)(?:\n\ncontent:)/);
  const contentMatch = raw.match(/(?:^|\n)content:\s*\|?\n?([\s\S]+)$/);

  return {
    title: titleMatch?.[1]?.trim(),
    summary: summaryMatch?.[1]?.trim(),
    content: contentMatch?.[1]
      ?.split('\n')
      .map(line => line.replace(/^ {2}/, ''))
      .join('\n')
      .trim(),
  };
}

// 백엔드가 reportContent 필드로 반환하는 것을 프론트 타입의 content로 정규화
function normalizeReport(raw: InsightReport & { reportContent?: string }): InsightReport {
  let { title, summary } = raw;
  let content = raw.content ?? raw.reportContent ?? null;

  // Claude 전체 출력이 summary 필드에 들어온 경우 파싱
  if (!content && summary?.trimStart().startsWith('title:')) {
    const parsed = parseClaudeOutput(summary);
    title = title ?? parsed.title;
    summary = parsed.summary;
    content = parsed.content ?? null;
  }

  return { ...raw, title, summary, content };
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

// ── 마켓 공공 데이터 참고 정보 ──────────────────────────────────────

export async function getMarketPublicDataReference(
  marketId: number,
): Promise<MarketPublicDataReferenceResponse> {
  const response = await httpClient.get<ApiResponse<MarketPublicDataReferenceResponse>>(
    `/api/v1/insights/markets/${marketId}/public-data-reference`,
    { timeout: 60000 }, // Claude API 응답 최대 60초 허용
  );
  return response.data.data;
}

// ── 관리자 마켓 실거래가 인사이트 ──────────────────────────────────

export async function getAdminMarketInsightPriceHistory(
  marketId: number,
): Promise<AdminMarketInsightPriceHistory> {
  const response = await httpClient.get<ApiResponse<AdminMarketInsightPriceHistory>>(
    `/api/v1/admin/insights/markets/${marketId}/price-history`,
  );
  return response.data.data;
}

// ── 관리자 인사이트 신규 API ──────────────────────────────────────────

const ADMIN_HEADER = { headers: { "X-Member-Role": "ADMIN" } };

export async function getAdminMarketDashboard(
  marketId: number,
): Promise<AdminMarketDashboard> {
  const response = await httpClient.get<ApiResponse<AdminMarketDashboard>>(
    `/api/v1/admin/insights/markets/${marketId}/dashboard`,
    ADMIN_HEADER,
  );
  return response.data.data;
}

export async function getAdminInsightsOverview(): Promise<AdminInsightsOverview> {
  const response = await httpClient.get<ApiResponse<AdminInsightsOverview>>(
    `/api/v1/admin/insights/overview`,
    ADMIN_HEADER,
  );
  return response.data.data;
}

export async function getAdminRegionsPriceMap(): Promise<AdminRegionsPriceMap> {
  const response = await httpClient.get<ApiResponse<AdminRegionsPriceMap>>(
    `/api/v1/admin/insights/regions/price-map`,
    ADMIN_HEADER,
  );
  return response.data.data;
}

export async function getAdminActivityTrend(): Promise<AdminActivityTrend> {
  const response = await httpClient.get<ApiResponse<AdminActivityTrend>>(
    `/api/v1/admin/insights/activity/trend`,
    ADMIN_HEADER,
  );
  return response.data.data;
}
