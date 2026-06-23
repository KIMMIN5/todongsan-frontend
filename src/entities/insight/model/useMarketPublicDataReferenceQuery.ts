import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { getMarketPublicDataReference } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useMarketPublicDataReferenceQuery(
  marketId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: insightKeys.marketPublicDataReference(marketId),
    queryFn: () => getMarketPublicDataReference(marketId),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      (options?.enabled ?? true),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 3 * 60 * 1000,
  });
}
