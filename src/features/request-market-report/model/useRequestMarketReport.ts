import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/entities/auth/model/useAuth";
import { useCreateMarketInsightMutation } from "@/entities/insight/model/useCreateMarketInsightMutation";
import { pointKeys } from "@/entities/point/model/point.keys";
import { createInsightReportIdempotencyKey } from "@/shared/lib/createIdempotencyKey";

export function useRequestMarketReport(marketId: number) {
  const { memberId } = useAuth();
  const mutation = useCreateMarketInsightMutation();
  const queryClient = useQueryClient();

  function requestReport() {
    if (!memberId) return;

    const idempotencyKey = createInsightReportIdempotencyKey(
      "MARKET",
      marketId,
      memberId,
    );

    return mutation.mutate(
      { marketId, idempotencyKey },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
        },
      },
    );
  }

  return {
    requestReport,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
