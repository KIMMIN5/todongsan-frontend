import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMarketComment } from "@/entities/market/api/marketCommentApi";
import { marketKeys } from "@/entities/market/model/market.keys";

export function useDeleteMarketCommentMutation(marketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => deleteMarketComment(marketId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketKeys.commentsRoot(marketId),
      });
    },
  });
}
