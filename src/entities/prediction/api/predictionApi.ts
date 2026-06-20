import type { ApiResponse } from "@/shared/api/apiResponse";
import { isApiError } from "@/shared/api/apiError";
import { httpClient } from "@/shared/api/httpClient";

import { createMarketPredictionSpendIdempotencyKey } from "../lib/idempotencyKey";
import type {
  CreateMarketPredictionRequest,
  CreateMarketPredictionResponse,
  MyMarketPrediction,
  MyMarketPredictionListParams,
  MyMarketPredictionListResponse,
} from "../model/prediction.types";

export async function getMyMarketPrediction(
  marketId: number,
): Promise<MyMarketPrediction | null> {
  try {
    const response = await httpClient.get<ApiResponse<MyMarketPrediction>>(
      `/api/v1/markets/${marketId}/predictions/me`,
    );
    return response.data.data;
  } catch (error) {
    if (
      isApiError(error) &&
      error.status === 404 &&
      error.errorCode === "MARKET_PREDICTION_NOT_FOUND"
    ) {
      return null;
    }
    throw error;
  }
}

export async function getMyMarketPredictions(
  params: MyMarketPredictionListParams,
): Promise<MyMarketPredictionListResponse> {
  // 배열 파라미터는 콤마 구분 문자열로 직렬화한다.
  // (Axios 기본 직렬화는 predictionStatus[0]=A 형태로 보내므로 수동 변환)
  const serialized: Record<string, unknown> = {
    page: params.page,
    size: params.size,
  };
  if (params.marketDisplayStatus?.length) {
    serialized.marketDisplayStatus = params.marketDisplayStatus.join(",");
  }
  if (params.predictionStatus?.length) {
    serialized.predictionStatus = params.predictionStatus.join(",");
  }

  const response = await httpClient.get<
    ApiResponse<MyMarketPredictionListResponse>
  >("/api/v1/markets/predictions/me", { params: serialized });

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
