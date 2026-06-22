import type {
  AdminMarketProblemListParams,
  AdminMarketRefundDetailListParams,
  AdminMarketSettlementDetailListParams,
  MarketListParams,
  MarketPriceHistoryParams,
} from "./market.types";

export const marketKeys = {
  all: ["markets"] as const,

  lists: () => [...marketKeys.all, "list"] as const,
  list: (params: MarketListParams) =>
    [...marketKeys.lists(), params] as const,

  details: () => [...marketKeys.all, "detail"] as const,
  detail: (marketId: number) =>
    [...marketKeys.details(), marketId] as const,

  priceHistories: () => [...marketKeys.all, "price-history"] as const,
  priceHistoryRoot: (marketId: number) =>
    [...marketKeys.priceHistories(), marketId] as const,
  priceHistory: (
    marketId: number,
    params: MarketPriceHistoryParams = {},
  ) => [...marketKeys.priceHistoryRoot(marketId), params] as const,

  adminStatusCounts: () => [...marketKeys.all, "admin-status-counts"] as const,

  adminDetails: () => [...marketKeys.all, "admin-detail"] as const,
  adminDetail: (marketId: number) =>
    [...marketKeys.adminDetails(), marketId] as const,

  adminProblemLists: () => [...marketKeys.all, "admin-problem-list"] as const,
  adminProblemList: (params: AdminMarketProblemListParams) =>
    [...marketKeys.adminProblemLists(), params] as const,

  adminSettlementSummaries: () =>
    [...marketKeys.all, "admin-settlement-summary"] as const,
  adminSettlementSummary: (marketId: number) =>
    [...marketKeys.adminSettlementSummaries(), marketId] as const,

  adminSettlementDetailLists: () =>
    [...marketKeys.all, "admin-settlement-detail-list"] as const,
  adminSettlementDetailList: (
    marketId: number,
    settlementId: number,
    params: AdminMarketSettlementDetailListParams = {},
  ) =>
    [
      ...marketKeys.adminSettlementDetailLists(),
      marketId,
      settlementId,
      params,
    ] as const,

  adminRefundSummaries: () => [...marketKeys.all, "admin-refund-summary"] as const,
  adminRefundSummary: (marketId: number) =>
    [...marketKeys.adminRefundSummaries(), marketId] as const,

  adminRefundDetailLists: () =>
    [...marketKeys.all, "admin-refund-detail-list"] as const,
  adminRefundDetailList: (
    marketId: number,
    voidId: number,
    params: AdminMarketRefundDetailListParams = {},
  ) => [...marketKeys.adminRefundDetailLists(), marketId, voidId, params] as const,
};
