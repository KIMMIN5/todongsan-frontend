import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/shared/api/apiError";

import { getBattleInsightReport } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useBattleInsightReportQuery(
  battleId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: insightKeys.battleUserReport(battleId),
    queryFn: () => getBattleInsightReport(battleId),
    enabled:
      Number.isFinite(battleId) &&
      battleId > 0 &&
      (options?.enabled ?? true),
    retry: (failureCount, error) => {
      if (isApiError(error) && error.errorCode === "INSIGHT_REPORT_NOT_FOUND") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
