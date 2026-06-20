import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/entities/auth/model/useAuth";
import { useCreateBattleInsightMutation } from "@/entities/insight/model/useCreateBattleInsightMutation";
import { pointKeys } from "@/entities/point/model/point.keys";
import { createInsightReportIdempotencyKey } from "@/shared/lib/createIdempotencyKey";

export function useRequestBattleReport(battleId: number) {
  const { memberId } = useAuth();
  const mutation = useCreateBattleInsightMutation();
  const queryClient = useQueryClient();

  async function requestReport() {
    if (!memberId) return;

    const idempotencyKey = createInsightReportIdempotencyKey(
      "BATTLE",
      battleId,
      memberId,
    );

    const result = await mutation.mutateAsync({ battleId, idempotencyKey });
    queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
    return result;
  }

  return {
    requestReport,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    error: mutation.error,
  };
}
