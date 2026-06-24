import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMarketComment } from "@/entities/market/api/marketCommentApi";
import { marketKeys } from "@/entities/market/model/market.keys";
import type { MarketCommentCreateRequest } from "@/entities/market/model/market.types";

export function useCreateMarketCommentMutation(marketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MarketCommentCreateRequest) =>
      createMarketComment(marketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketKeys.commentsRoot(marketId),
      });
    },
  });
}
