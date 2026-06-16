import { useMutation } from "@tanstack/react-query";

import { createMarketPrediction } from "../api/predictionApi";
import type { CreateMarketPredictionRequest } from "./prediction.types";

type CreateMarketPredictionVariables = {
  marketId: number;
  memberId: number | string;
  request: CreateMarketPredictionRequest;
};

export function useCreateMarketPredictionMutation() {
  return useMutation({
    mutationFn: (variables: CreateMarketPredictionVariables) =>
      createMarketPrediction(variables),
  });
}
