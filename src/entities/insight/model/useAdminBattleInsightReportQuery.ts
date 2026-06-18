import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/shared/api/apiError";

import { getAdminBattleInsightReport } from "../api/insightApi";
import type { InsightReport } from "./insight.types";
import { insightKeys } from "./insight.keys";

function shouldPollReport(report?: InsightReport): boolean {
  return (
    report?.status === "PENDING" || report?.status === "PROCESSING"
  );
}

export function useAdminBattleInsightReportQuery(battleId: number) {
  return useQuery({
    queryKey: insightKeys.battleReport(battleId),
    queryFn: () => getAdminBattleInsightReport(battleId),
    enabled: Number.isFinite(battleId) && battleId > 0,
    refetchInterval: (query) =>
      shouldPollReport(query.state.data) ? 2000 : false,
    retry: (failureCount, error) => {
      if (isApiError(error) && error.errorCode === "INSIGHT_REPORT_NOT_FOUND") {
        return false;
      }

      return failureCount < 3;
    },
  });
}
