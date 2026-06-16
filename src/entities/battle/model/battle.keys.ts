import type { BattleCommentListParams, BattleListParams } from "./battle.types";

export const battleKeys = {
  all: ["battles"] as const,
  list: (params: BattleListParams) => ["battles", "list", params] as const,
  detail: (battleId: number) => ["battles", "detail", battleId] as const,
  result: (battleId: number) => ["battles", "result", battleId] as const,
  // 특정 배틀의 모든 댓글 쿼리 prefix (페이지 무관 무효화용)
  comments: (battleId: number) => ["battles", "comments", battleId] as const,
  // 페이지 단위 댓글 쿼리 키
  commentsPage: (battleId: number, params: BattleCommentListParams) =>
    ["battles", "comments", battleId, params] as const,
};

export const adminBattleKeys = {
  all: ["admin", "battles"] as const,
  list: (params: BattleListParams) =>
    ["admin", "battles", "list", params] as const,
  detail: (battleId: number) => ["admin", "battles", "detail", battleId] as const,
  analysis: (battleId: number) =>
    ["admin", "battles", "analysis", battleId] as const,
  report: (battleId: number) => ["admin", "battles", "report", battleId] as const,
};
