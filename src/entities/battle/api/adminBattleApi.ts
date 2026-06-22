import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  AdminBattlePendingListParams,
  AdminBattleStatusResponse,
  BattleDetail,
  BattlePage,
} from "../model/battle.types";

// GET /api/v1/battles/admin/pending (관리자 - PENDING 배틀 목록)
export async function getAdminPendingBattles(
  params: AdminBattlePendingListParams,
): Promise<BattlePage<BattleDetail>> {
  const response = await httpClient.get<ApiResponse<BattlePage<BattleDetail>>>(
    "/api/v1/battles/admin/pending",
    { params },
  );

  return response.data.data;
}

// GET /api/v1/battles/admin/{battleId} (관리자 - PENDING 포함 단건 조회)
export async function getAdminBattleDetail(
  battleId: number,
): Promise<BattleDetail> {
  const response = await httpClient.get<ApiResponse<BattleDetail>>(
    `/api/v1/battles/admin/${battleId}`,
  );

  return response.data.data;
}

// PATCH /api/v1/battles/admin/{battleId}/approve (관리자 - 승인)
export async function approveBattle(
  battleId: number,
): Promise<AdminBattleStatusResponse> {
  const response = await httpClient.patch<ApiResponse<AdminBattleStatusResponse>>(
    `/api/v1/battles/admin/${battleId}/approve`,
  );

  return response.data.data;
}

// PATCH /api/v1/battles/admin/{battleId}/reject (관리자 - 거절)
export async function rejectBattle(
  battleId: number,
): Promise<AdminBattleStatusResponse> {
  const response = await httpClient.patch<ApiResponse<AdminBattleStatusResponse>>(
    `/api/v1/battles/admin/${battleId}/reject`,
  );

  return response.data.data;
}

// PATCH /api/v1/battles/admin/{battleId}/cancel (관리자 - 강제 취소)
export async function cancelBattle(
  battleId: number,
): Promise<AdminBattleStatusResponse> {
  const response = await httpClient.patch<ApiResponse<AdminBattleStatusResponse>>(
    `/api/v1/battles/admin/${battleId}/cancel`,
  );

  return response.data.data;
}
