import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type { MyMarketPrediction } from "../model/prediction.types";

export async function getMyMarketPrediction(
  marketId: number,
): Promise<MyMarketPrediction> {
  const response = await httpClient.get<ApiResponse<MyMarketPrediction>>(
    `/api/v1/markets/${marketId}/predictions/me`,
  );

  return response.data.data;
}
