import { useAuth } from "@/entities/auth/model/useAuth";
import { useCreateMarketInsightMutation } from "@/entities/insight/model/useCreateMarketInsightMutation";
import { createInsightReportIdempotencyKey } from "@/shared/lib/createIdempotencyKey";

export function useRequestMarketReport(marketId: number) {
  const { memberId } = useAuth();
  const mutation = useCreateMarketInsightMutation();

  function requestReport() {
    if (!memberId) return;

    const idempotencyKey = createInsightReportIdempotencyKey(
      "MARKET",
      marketId,
      memberId,
    );

    return mutation.mutate({ marketId, idempotencyKey });
  }

  return {
    requestReport,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
