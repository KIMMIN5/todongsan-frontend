import { useQuery } from "@tanstack/react-query";

import { getAdminMarketStatusCounts } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useAdminMarketStatusCountsQuery() {
  return useQuery({
    queryKey: marketKeys.adminStatusCounts(),
    queryFn: getAdminMarketStatusCounts,
  });
}
