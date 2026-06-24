import { useQuery } from "@tanstack/react-query";

import { getAdminActivityTrend } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminActivityTrendQuery() {
  return useQuery({
    queryKey: insightKeys.adminActivityTrend(),
    queryFn: getAdminActivityTrend,
    staleTime: 1000 * 60 * 5,
  });
}
