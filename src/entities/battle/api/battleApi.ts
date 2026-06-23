import type { ApiResponse } from "@/shared/api/apiResponse";
import { httpClient } from "@/shared/api/httpClient";

import type {
  AdminBattleStatusResponse,
  BattleComment,
  BattleCommentListParams,
  BattleDetail,
  BattleListParams,
  BattlePage,
  BattleResult,
  BattleSummary,
  CreateBattleRequest,
  CreateBattleResponse,
  CreateCommentRequest,
  CreateVoteRequest,
  MyBattleVoteItem,
  MyBattleVoteListParams,
  MyCreatedBattleItem,
  MyCreatedBattleListParams,
  VoteResponse,
} from "../model/battle.types";

// POST /api/v1/battles (인증 필요)
export async function createBattle(
  request: CreateBattleRequest,
): Promise<CreateBattleResponse> {
  const response = await httpClient.post<ApiResponse<CreateBattleResponse>>(
    "/api/v1/battles",
    request,
  );

  return response.data.data;
}

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

// GET /api/v1/battles/votes/me (인증 필요) - 내 참여(투표) 배틀 목록
export async function getMyBattleVotes(
  params: MyBattleVoteListParams,
): Promise<BattlePage<MyBattleVoteItem>> {
  // status 배열은 콤마 구분 문자열로 직렬화 (Axios 기본 직렬화 회피)
  const serialized: Record<string, unknown> = {
    page: params.page,
    size: params.size,
  };
  if (params.status?.length) {
    serialized.status = params.status.join(",");
  }

  const response = await httpClient.get<
    ApiResponse<BattlePage<MyBattleVoteItem>>
  >("/api/v1/battles/votes/me", { params: serialized });

  return response.data.data;
}

// GET /api/v1/battles/created/me (인증 필요) - 내가 만든 배틀 목록
export async function getMyCreatedBattles(
  params: MyCreatedBattleListParams,
): Promise<BattlePage<MyCreatedBattleItem>> {
  // status 배열은 콤마 구분 문자열로 직렬화 (Axios 기본 직렬화 회피)
  const serialized: Record<string, unknown> = {
    page: params.page,
    size: params.size,
  };
  if (params.status?.length) {
    serialized.status = params.status.join(",");
  }

  const response = await httpClient.get<
    ApiResponse<BattlePage<MyCreatedBattleItem>>
  >("/api/v1/battles/created/me", { params: serialized });

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

// PATCH /api/v1/battles/{battleId}/cancel (인증 필요, 본인 PENDING 배틀만)
export async function cancelMyBattle(
  battleId: number,
): Promise<AdminBattleStatusResponse> {
  const response = await httpClient.patch<ApiResponse<AdminBattleStatusResponse>>(
    `/api/v1/battles/${battleId}/cancel`,
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
