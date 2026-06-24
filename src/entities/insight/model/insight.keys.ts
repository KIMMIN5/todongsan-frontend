import type { 
  InsightReportType, 
  InsightReportListParams 
} from './insight.types';

export const insightKeys = {
  all: ["insights"] as const,
  reportList: (params: InsightReportListParams) => ["insights", "reports", params] as const,
  marketReport: (marketId: number) => ["insights", "marketReport", marketId] as const,
  marketReportStatus: (marketId: number) => ["insights", "marketReportStatus", marketId] as const,
  // admin-only
  battleReport: (battleId: number) => ["insights", "battleReport", battleId] as const,
  adminMarketPriceHistory: (marketId: number) => ["insights", "adminMarketPriceHistory", marketId] as const,
  marketPublicDataReference: (marketId: number) => ["insights", "marketPublicDataReference", marketId] as const,
  // user-facing battle report (별도 키 — 관리자 캐시와 분리)
  battleUserReport: (battleId: number) => ["insights", "battleUserReport", battleId] as const,
  battleUserReportStatus: (battleId: number) => ["insights", "battleUserReportStatus", battleId] as const,
  report: (type: InsightReportType, referenceId: number) =>
    ["insights", "report", type, referenceId] as const,
  // admin insights
  adminMarketDashboard: (marketId: number) => ["insights", "adminMarketDashboard", marketId] as const,
  adminBattleReportAnalysis: (battleId: number) => ["insights", "adminBattleReportAnalysis", battleId] as const,
  adminOverview: () => ["insights", "adminOverview"] as const,
  adminRegionsPriceMap: () => ["insights", "adminRegionsPriceMap"] as const,
  adminActivityTrend: () => ["insights", "adminActivityTrend"] as const,
};
