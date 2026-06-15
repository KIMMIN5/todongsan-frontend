import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  MarketDetail,
  MarketListParams,
  MarketListResponse,
  MarketPriceHistoryParams,
  MarketPriceHistoryResponse,
  MarketPredictionQuoteRequest,
  MarketPredictionQuoteResponse,
} from "../model/market.types";

export async function getMarketList(
  params: MarketListParams,
): Promise<MarketListResponse> {
  const response = await httpClient.get<ApiResponse<MarketListResponse>>(
    "/api/v1/markets",
    { params },
  );

  return response.data.data;
}

export async function getMarketDetail(
  marketId: number,
): Promise<MarketDetail> {
  const response = await httpClient.get<ApiResponse<MarketDetail>>(
    `/api/v1/markets/${marketId}`,
  );

  return response.data.data;
}

export async function getMarketPriceHistory(
  marketId: number,
  params: MarketPriceHistoryParams = {},
): Promise<MarketPriceHistoryResponse> {
  const response = await httpClient.get<ApiResponse<MarketPriceHistoryResponse>>(
    `/api/v1/markets/${marketId}/price-history`,
    { params },
  );

  return response.data.data;
}

export async function getMarketPredictionQuote(
  marketId: number,
  request: MarketPredictionQuoteRequest,
): Promise<MarketPredictionQuoteResponse> {
  const response = await httpClient.post<
    ApiResponse<MarketPredictionQuoteResponse>
  >(`/api/v1/markets/${marketId}/predictions/quote`, request);

  return response.data.data;
}
