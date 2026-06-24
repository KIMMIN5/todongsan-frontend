import { useQuery } from "@tanstack/react-query";

import { getAdminBattleReportAnalysis } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminBattleReportAnalysisQuery(battleId: number) {
  return useQuery({
    queryKey: insightKeys.adminBattleReportAnalysis(battleId),
    queryFn: () => getAdminBattleReportAnalysis(battleId),
    enabled: Number.isFinite(battleId) && battleId > 0,
  });
}
