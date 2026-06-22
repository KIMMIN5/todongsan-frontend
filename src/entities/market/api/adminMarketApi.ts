import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  AdminMarketDetail,
  AdminMarketProblemListParams,
  AdminMarketProblemListResponse,
  AdminMarketRefundDetailListParams,
  AdminMarketRefundDetailPage,
  AdminMarketRefundSummary,
  AdminMarketResultRequest,
  AdminMarketSettlementDetailListParams,
  AdminMarketSettlementDetailPage,
  AdminMarketSettlementSummary,
  AdminMarketStatusCounts,
  RefundMarketResponse,
  SettleMarketResponse,
  VoidMarketRequest,
  VoidMarketResponse,
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

/**
 * Market 무효 처리. status가 PENDING/ACTIVE/CLOSED/DATA_PENDING일 때만 가능하며,
 * Member-Point 환불은 호출하지 않는다(환불 실행은 별도 API).
 */
export async function voidMarket(
  marketId: number,
  request: VoidMarketRequest,
): Promise<VoidMarketResponse> {
  const response = await httpClient.patch<ApiResponse<VoidMarketResponse>>(
    `/api/v1/admin/markets/${marketId}/void`,
    request,
  );

  return response.data.data;
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

/** 정산 요약 조회. 정산 row가 없어도 200으로 빈 요약을 반환한다. */
export async function getAdminMarketSettlementSummary(
  marketId: number,
): Promise<AdminMarketSettlementSummary> {
  const response = await httpClient.get<ApiResponse<AdminMarketSettlementSummary>>(
    `/api/v1/admin/markets/${marketId}/settlements`,
  );

  return response.data.data;
}

/** 정산 detail 목록 조회. FAILED/UNKNOWN 등 재시도 대상 식별에 사용. */
export async function getAdminMarketSettlementDetails(
  marketId: number,
  settlementId: number,
  params: AdminMarketSettlementDetailListParams = {},
): Promise<AdminMarketSettlementDetailPage> {
  const response = await httpClient.get<ApiResponse<AdminMarketSettlementDetailPage>>(
    `/api/v1/admin/markets/${marketId}/settlements/${settlementId}/details`,
    { params },
  );

  return response.data.data;
}

/** 환불 요약 조회. void row가 없어도 200으로 빈 요약을 반환한다. */
export async function getAdminMarketRefundSummary(
  marketId: number,
): Promise<AdminMarketRefundSummary> {
  const response = await httpClient.get<ApiResponse<AdminMarketRefundSummary>>(
    `/api/v1/admin/markets/${marketId}/refunds`,
  );

  return response.data.data;
}

/** 환불 detail 목록 조회. FAILED/UNKNOWN/3분 이상 PENDING 등 재시도 대상 식별에 사용. */
export async function getAdminMarketRefundDetails(
  marketId: number,
  voidId: number,
  params: AdminMarketRefundDetailListParams = {},
): Promise<AdminMarketRefundDetailPage> {
  const response = await httpClient.get<ApiResponse<AdminMarketRefundDetailPage>>(
    `/api/v1/admin/markets/${marketId}/refunds/${voidId}/details`,
    { params },
  );

  return response.data.data;
}

/**
 * 환불 실행. Market.status === VOIDED일 때만 호출 가능하며, CONFIRMED Prediction의
 * 원금을 환불한다. 환불 대상이 없어도 200으로 성공 응답한다(refundTargetCount=0).
 */
export async function executeMarketRefund(
  marketId: number,
): Promise<RefundMarketResponse> {
  const response = await httpClient.post<ApiResponse<RefundMarketResponse>>(
    `/api/v1/admin/markets/${marketId}/refunds`,
  );

  return response.data.data;
}

/**
 * 정산 재시도. 이미 생성된 market_settlement/detail 중 FAILED/UNKNOWN만 재시도하며
 * 새 정산 row를 만들거나 금액을 다시 계산하지 않는다.
 */
export async function retryMarketSettlement(
  marketId: number,
): Promise<SettleMarketResponse> {
  const response = await httpClient.post<ApiResponse<SettleMarketResponse>>(
    `/api/v1/admin/markets/${marketId}/settlements/retry`,
  );

  return response.data.data;
}

/**
 * 환불 재시도. FAILED/UNKNOWN 또는 3분 이상 PENDING인 market_refund_detail만 재시도하며
 * 새 market_void/detail을 만들거나 환불 금액을 다시 계산하지 않는다.
 */
export async function retryMarketRefund(
  marketId: number,
): Promise<RefundMarketResponse> {
  const response = await httpClient.post<ApiResponse<RefundMarketResponse>>(
    `/api/v1/admin/markets/${marketId}/refunds/retry`,
  );

  return response.data.data;
}
