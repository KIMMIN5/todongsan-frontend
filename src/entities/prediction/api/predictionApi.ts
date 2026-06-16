import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import { createMarketPredictionSpendIdempotencyKey } from "../lib/idempotencyKey";
import type {
  CreateMarketPredictionRequest,
  CreateMarketPredictionResponse,
  MyMarketPrediction,
} from "../model/prediction.types";

export async function getMyMarketPrediction(
  marketId: number,
): Promise<MyMarketPrediction> {
  const response = await httpClient.get<ApiResponse<MyMarketPrediction>>(
    `/api/v1/markets/${marketId}/predictions/me`,
  );

  return response.data.data;
}

export async function createMarketPrediction(params: {
  marketId: number;
  memberId: number | string;
  request: CreateMarketPredictionRequest;
}): Promise<CreateMarketPredictionResponse> {
  const idempotencyKey = createMarketPredictionSpendIdempotencyKey({
    marketId: params.marketId,
    memberId: params.memberId,
  });

  const response = await httpClient.post<
    ApiResponse<CreateMarketPredictionResponse>
  >(`/api/v1/markets/${params.marketId}/predictions`, params.request, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

  return response.data.data;
}
