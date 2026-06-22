import { useQuery } from "@tanstack/react-query";

import { getAdminMarketDetail } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useAdminMarketDetailQuery(marketId: number) {
  return useQuery({
    queryKey: marketKeys.adminDetail(marketId),
    queryFn: () => getAdminMarketDetail(marketId),
    enabled: Number.isFinite(marketId) && marketId > 0,
  });
}
