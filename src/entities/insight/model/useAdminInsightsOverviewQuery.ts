import { useQuery } from "@tanstack/react-query";

import { getAdminInsightsOverview } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminInsightsOverviewQuery() {
  return useQuery({
    queryKey: insightKeys.adminOverview(),
    queryFn: getAdminInsightsOverview,
    staleTime: 1000 * 60 * 5,
  });
}
