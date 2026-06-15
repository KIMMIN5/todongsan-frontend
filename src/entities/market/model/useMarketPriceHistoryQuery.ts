import { useQuery } from "@tanstack/react-query";

import { getMarketPriceHistory } from "../api/marketApi";
import { marketKeys } from "./market.keys";
import type { MarketPriceHistoryParams } from "./market.types";

export function useMarketPriceHistoryQuery(
  marketId: number,
  params: MarketPriceHistoryParams = {},
) {
  return useQuery({
    queryKey: marketKeys.priceHistory(marketId, params),
    queryFn: () => getMarketPriceHistory(marketId, params),
    enabled: Number.isFinite(marketId) && marketId > 0,
  });
}
