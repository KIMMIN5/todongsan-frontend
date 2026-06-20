import { useQuery } from "@tanstack/react-query";

import { getMarketInsightReportStatus } from "../api/insightApi";
import type { InsightReportStatusInfo } from "./insight.types";
import { insightKeys } from "./insight.keys";

function shouldPollStatus(status?: InsightReportStatusInfo): boolean {
  return (
    status?.status === "PENDING" || status?.status === "PROCESSING"
  );
}

export function useMarketInsightStatusQuery(
  marketId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: insightKeys.marketReportStatus(marketId),
    queryFn: () => getMarketInsightReportStatus(marketId),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      (options?.enabled ?? true),
    refetchInterval: (query) =>
      shouldPollStatus(query.state.data) ? 2000 : false,
  });
}
