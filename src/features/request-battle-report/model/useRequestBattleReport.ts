import { useAuth } from "@/entities/auth/model/useAuth";
import { useCreateBattleInsightMutation } from "@/entities/insight/model/useCreateBattleInsightMutation";
import { createInsightReportIdempotencyKey } from "@/shared/lib/createIdempotencyKey";

export function useRequestBattleReport(battleId: number) {
  const { memberId } = useAuth();
  const mutation = useCreateBattleInsightMutation();

  function requestReport() {
    if (!memberId) return;

    const idempotencyKey = createInsightReportIdempotencyKey(
      "BATTLE",
      battleId,
      memberId,
    );

    return mutation.mutate({ battleId, idempotencyKey });
  }

  return {
    requestReport,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    error: mutation.error,
  };
}
