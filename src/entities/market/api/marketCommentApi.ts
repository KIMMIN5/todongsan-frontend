import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  MarketComment,
  MarketCommentCreateRequest,
  MarketCommentDeleteResponse,
  MarketCommentListParams,
  MarketCommentPageResponse,
} from "../model/market.types";

export async function getMarketComments(
  marketId: number,
  params: MarketCommentListParams = {},
): Promise<MarketCommentPageResponse> {
  const response = await httpClient.get<ApiResponse<MarketCommentPageResponse>>(
    `/api/v1/markets/${marketId}/comments`,
    { params },
  );

  return response.data.data;
}

export async function createMarketComment(
  marketId: number,
  request: MarketCommentCreateRequest,
): Promise<MarketComment> {
  const response = await httpClient.post<ApiResponse<MarketComment>>(
    `/api/v1/markets/${marketId}/comments`,
    request,
  );

  return response.data.data;
}

export async function deleteMarketComment(
  marketId: number,
  commentId: number,
): Promise<MarketCommentDeleteResponse> {
  const response = await httpClient.delete<ApiResponse<MarketCommentDeleteResponse>>(
    `/api/v1/markets/${marketId}/comments/${commentId}`,
  );

  return response.data.data;
}
