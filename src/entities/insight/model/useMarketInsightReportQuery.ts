import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/shared/api/apiError";

import { getMarketInsightReport } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useMarketInsightReportQuery(
  marketId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: insightKeys.marketReport(marketId),
    queryFn: () => getMarketInsightReport(marketId),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      (options?.enabled ?? true),
    retry: (failureCount, error) => {
      if (isApiError(error) && error.errorCode === "INSIGHT_REPORT_NOT_FOUND") {
        return false;
      }

      return failureCount < 3;
    },
  });
}
