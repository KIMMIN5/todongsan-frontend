import { useQuery } from "@tanstack/react-query";

import { getAdminMarketRefundSummary } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useAdminMarketRefundSummaryQuery(
  marketId: number,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: marketKeys.adminRefundSummary(marketId),
    queryFn: () => getAdminMarketRefundSummary(marketId),
    enabled:
      Number.isFinite(marketId) && marketId > 0 && (options.enabled ?? true),
  });
}
