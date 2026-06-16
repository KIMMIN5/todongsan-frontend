import type {
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
};
