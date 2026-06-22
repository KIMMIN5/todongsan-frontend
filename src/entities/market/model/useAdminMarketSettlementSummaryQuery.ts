import { useQuery } from "@tanstack/react-query";

import { getAdminMarketSettlementSummary } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useAdminMarketSettlementSummaryQuery(
  marketId: number,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: marketKeys.adminSettlementSummary(marketId),
    queryFn: () => getAdminMarketSettlementSummary(marketId),
    enabled:
      Number.isFinite(marketId) && marketId > 0 && (options.enabled ?? true),
  });
}
