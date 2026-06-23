import { useQuery } from "@tanstack/react-query";

import { getAdminMarketInsightPriceHistory } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminMarketInsightPriceHistoryQuery(marketId: number) {
  return useQuery({
    queryKey: insightKeys.adminMarketPriceHistory(marketId),
    queryFn: () => getAdminMarketInsightPriceHistory(marketId),
    enabled: Number.isFinite(marketId) && marketId > 0,
    retry: 3,
  });
}
