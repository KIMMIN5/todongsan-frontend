import { useMutation, useQueryClient } from "@tanstack/react-query";

import { voidMarket } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";
import type { VoidMarketRequest } from "./market.types";

type Variables = {
  marketId: number;
  request: VoidMarketRequest;
};

export function useVoidMarketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ marketId, request }: Variables) => voidMarket(marketId, request),
    onSuccess: (_data, { marketId }) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.adminDetail(marketId) });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminProblemLists() });
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}
