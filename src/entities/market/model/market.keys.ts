import type {
  MarketListParams,
  MarketPriceHistoryParams,
} from "./market.types";

export const marketKeys = {
  all: ["markets"] as const,
  list: (params: MarketListParams) =>
    [...marketKeys.all, "list", params] as const,
  detail: (marketId: number) =>
    [...marketKeys.all, "detail", marketId] as const,
  priceHistory: (
    marketId: number,
    params: MarketPriceHistoryParams = {},
  ) => [...marketKeys.all, "price-history", marketId, params] as const,
};
