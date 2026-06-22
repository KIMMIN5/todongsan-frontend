import { useMutation, useQueryClient } from "@tanstack/react-query";

import { retryMarketSettlement } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useRetryMarketSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketId: number) => retryMarketSettlement(marketId),
    onSuccess: (_data, marketId) => {
      queryClient.invalidateQueries({
        queryKey: marketKeys.adminSettlementSummary(marketId),
      });
      queryClient.invalidateQueries({
        queryKey: marketKeys.adminSettlementDetailLists(),
      });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminDetail(marketId) });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminProblemLists() });
    },
  });
}
