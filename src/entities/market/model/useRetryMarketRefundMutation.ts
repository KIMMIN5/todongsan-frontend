import { useMutation, useQueryClient } from "@tanstack/react-query";

import { retryMarketRefund } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useRetryMarketRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketId: number) => retryMarketRefund(marketId),
    onSuccess: (_data, marketId) => {
      queryClient.invalidateQueries({
        queryKey: marketKeys.adminRefundSummary(marketId),
      });
      queryClient.invalidateQueries({
        queryKey: marketKeys.adminRefundDetailLists(),
      });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminDetail(marketId) });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminProblemLists() });
    },
  });
}
