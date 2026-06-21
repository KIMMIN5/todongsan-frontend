import { useMutation, useQueryClient } from "@tanstack/react-query";

import { executeMarketSettlement } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useExecuteMarketSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketId: number) => executeMarketSettlement(marketId),
    onSuccess: (_data, marketId) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.adminDetail(marketId) });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}
