import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  AdminMarketDetail,
  AdminMarketProblemListParams,
  AdminMarketProblemListResponse,
  AdminMarketResultRequest,
  AdminMarketStatusCounts,
} from "../model/market.types";

export async function getAdminMarketStatusCounts(): Promise<AdminMarketStatusCounts> {
  const response = await httpClient.get<ApiResponse<AdminMarketStatusCounts>>(
    "/api/v1/admin/markets/status-counts",
  );

  return response.data.data;
}

export async function getAdminMarketDetail(
  marketId: number,
): Promise<AdminMarketDetail> {
  const response = await httpClient.get<ApiResponse<AdminMarketDetail>>(
    `/api/v1/admin/markets/${marketId}`,
  );

  return response.data.data;
}

/** 결과 확정. 정산을 실행하지 않으며 성공 시 status가 CLOSED로 바뀐다. */
export async function confirmMarketResult(
  marketId: number,
  request: AdminMarketResultRequest,
): Promise<void> {
  await httpClient.patch(`/api/v1/admin/markets/${marketId}/result`, request);
}

/** 정산 실행. status==CLOSED일 때만 호출 가능. */
export async function executeMarketSettlement(marketId: number): Promise<void> {
  await httpClient.post(`/api/v1/admin/markets/${marketId}/settlements`);
}

export async function getAdminMarketProblemList(
  params: AdminMarketProblemListParams,
): Promise<AdminMarketProblemListResponse> {
  const response = await httpClient.get<ApiResponse<AdminMarketProblemListResponse>>(
    "/api/v1/admin/markets/problem-markets",
    { params },
  );

  return response.data.data;
}
