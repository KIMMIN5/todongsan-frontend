import { useQuery } from "@tanstack/react-query";

import { getBattleInsightReportStatus } from "../api/insightApi";
import type { InsightReportStatusInfo } from "./insight.types";
import { insightKeys } from "./insight.keys";

function shouldPollStatus(status?: InsightReportStatusInfo): boolean {
  return status?.status === "PENDING" || status?.status === "PROCESSING";
}

export function useBattleInsightStatusQuery(
  battleId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: insightKeys.battleUserReportStatus(battleId),
    queryFn: () => getBattleInsightReportStatus(battleId),
    enabled:
      Number.isFinite(battleId) &&
      battleId > 0 &&
      (options?.enabled ?? true),
    refetchInterval: (query) =>
      shouldPollStatus(query.state.data) ? 2000 : false,
  });
}
