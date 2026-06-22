import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmMarketResult } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";
import type { AdminMarketResultRequest } from "./market.types";

type Variables = {
  marketId: number;
  request: AdminMarketResultRequest;
};

export function useConfirmMarketResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ marketId, request }: Variables) =>
      confirmMarketResult(marketId, request),
    onSuccess: (_data, { marketId }) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.adminDetail(marketId) });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}
