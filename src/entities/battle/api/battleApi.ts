import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  BattleComment,
  BattleCommentListParams,
  BattleDetail,
  BattleListParams,
  BattlePage,
  BattleResult,
  BattleSummary,
  CreateCommentRequest,
  CreateVoteRequest,
  VoteResponse,
} from "../model/battle.types";

// GET /api/v1/battles
export async function getBattleList(
  params: BattleListParams,
): Promise<BattlePage<BattleSummary>> {
  const response = await httpClient.get<ApiResponse<BattlePage<BattleSummary>>>(
    "/api/v1/battles",
    { params },
  );

  return response.data.data;
}

// GET /api/v1/battles/{battleId}
export async function getBattleDetail(
  battleId: number,
): Promise<BattleDetail> {
  const response = await httpClient.get<ApiResponse<BattleDetail>>(
    `/api/v1/battles/${battleId}`,
  );

  return response.data.data;
}

// GET /api/v1/battles/{battleId}/result
export async function getBattleResult(
  battleId: number,
): Promise<BattleResult> {
  const response = await httpClient.get<ApiResponse<BattleResult>>(
    `/api/v1/battles/${battleId}/result`,
  );

  return response.data.data;
}

// GET /api/v1/battles/{battleId}/comments
export async function getBattleComments(
  battleId: number,
  params: BattleCommentListParams,
): Promise<BattlePage<BattleComment>> {
  const response = await httpClient.get<ApiResponse<BattlePage<BattleComment>>>(
    `/api/v1/battles/${battleId}/comments`,
    { params },
  );

  return response.data.data;
}

// POST /api/v1/battles/{battleId}/votes (인증 필요)
export async function createBattleVote(
  battleId: number,
  request: CreateVoteRequest,
): Promise<VoteResponse> {
  const response = await httpClient.post<ApiResponse<VoteResponse>>(
    `/api/v1/battles/${battleId}/votes`,
    request,
  );

  return response.data.data;
}

// POST /api/v1/battles/{battleId}/comments (인증 필요)
export async function createBattleComment(
  battleId: number,
  request: CreateCommentRequest,
): Promise<BattleComment> {
  const response = await httpClient.post<ApiResponse<BattleComment>>(
    `/api/v1/battles/${battleId}/comments`,
    request,
  );

  return response.data.data;
}

// DELETE /api/v1/battles/{battleId}/comments/{commentId} (인증 필요, 본인 댓글만)
export async function deleteBattleComment(
  battleId: number,
  commentId: number,
): Promise<void> {
  await httpClient.delete<ApiResponse<null>>(
    `/api/v1/battles/${battleId}/comments/${commentId}`,
  );
}
