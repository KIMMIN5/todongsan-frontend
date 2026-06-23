import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMarket } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";
import type { CreateMarketRequest } from "./market.types";

export function useCreateMarketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMarketRequest) => createMarket(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketKeys.adminStatusCounts() });
    },
  });
}
