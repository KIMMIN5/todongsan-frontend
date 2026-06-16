import { useQuery } from "@tanstack/react-query";

import { getMyMarketPrediction } from "../api/predictionApi";
import { predictionKeys } from "./prediction.keys";
import type { MyMarketPrediction } from "./prediction.types";

function shouldPollPrediction(prediction?: MyMarketPrediction | null): boolean {
  return (
    prediction?.status === "POINT_PENDING" ||
    prediction?.status === "POINT_UNKNOWN" ||
    prediction?.status === "REFUND_PENDING" ||
    prediction?.status === "REFUND_UNKNOWN"
  );
}

export function useMyMarketPredictionQuery(
  marketId: number,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: predictionKeys.myMarketPrediction(marketId),
    queryFn: () => getMyMarketPrediction(marketId),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      (options?.enabled ?? true),
    refetchInterval: (query) =>
      shouldPollPrediction(query.state.data) ? 3000 : false,
  });
}
