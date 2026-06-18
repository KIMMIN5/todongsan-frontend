import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pointKeys } from "@/entities/point/model/point.keys";

import { createMarketInsightReport } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

type CreateMarketInsightVariables = {
  marketId: number;
  idempotencyKey: string;
};

export function useCreateMarketInsightMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ marketId, idempotencyKey }: CreateMarketInsightVariables) =>
      createMarketInsightReport(marketId, idempotencyKey),
    onSuccess: (_, { marketId }) => {
      queryClient.invalidateQueries({
        queryKey: insightKeys.marketReport(marketId),
      });
      queryClient.invalidateQueries({
        queryKey: insightKeys.marketReportStatus(marketId),
      });
      queryClient.invalidateQueries({
        queryKey: pointKeys.balance(),
      });
    },
  });
}
