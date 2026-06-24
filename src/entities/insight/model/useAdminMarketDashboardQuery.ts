import { useQuery } from "@tanstack/react-query";

import { getAdminMarketDashboard } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminMarketDashboardQuery(marketId: number) {
  return useQuery({
    queryKey: insightKeys.adminMarketDashboard(marketId),
    queryFn: () => getAdminMarketDashboard(marketId),
    enabled: Number.isFinite(marketId) && marketId > 0,
  });
}
