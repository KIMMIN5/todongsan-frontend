import { useMutation, useQueryClient } from "@tanstack/react-query";

import { activateMarket } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";

export function useActivateMarketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketId: number) => activateMarket(marketId),
    onSuccess: (_data, marketId) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.adminDetail(marketId) });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}
