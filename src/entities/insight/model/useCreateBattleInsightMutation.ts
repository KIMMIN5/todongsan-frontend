import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pointKeys } from "@/entities/point/model/point.keys";

import { createBattleInsightReport } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

type CreateBattleInsightVariables = {
  battleId: number;
  idempotencyKey: string;
};

export function useCreateBattleInsightMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ battleId, idempotencyKey }: CreateBattleInsightVariables) =>
      createBattleInsightReport(battleId, idempotencyKey),
    onSuccess: (_, { battleId }) => {
      queryClient.invalidateQueries({
        queryKey: insightKeys.battleUserReport(battleId),
      });
      queryClient.invalidateQueries({
        queryKey: insightKeys.battleUserReportStatus(battleId),
      });
      queryClient.invalidateQueries({
        queryKey: pointKeys.balance(),
      });
    },
  });
}
