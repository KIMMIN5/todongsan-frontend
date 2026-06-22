import type {
  BattleCommentListParams,
  BattleListParams,
  MyBattleVoteListParams,
  MyCreatedBattleListParams,
} from "./battle.types";

type MyBattleVoteFilters = Omit<MyBattleVoteListParams, "page" | "size">;
type MyCreatedBattleFilters = Omit<MyCreatedBattleListParams, "page" | "size">;

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
  // 내 참여(투표) 배틀 목록
  myVotes: () => ["battles", "my-votes"] as const,
  myVotesList: (filters: MyBattleVoteFilters) =>
    ["battles", "my-votes", filters] as const,
  // 내가 만든 배틀 목록
  myCreated: () => ["battles", "my-created"] as const,
  myCreatedList: (filters: MyCreatedBattleFilters) =>
    ["battles", "my-created", filters] as const,
};

export const adminBattleKeys = {
  all: ["admin", "battles"] as const,
  list: (params: BattleListParams) =>
    ["admin", "battles", "list", params] as const,
  pendingList: (params: { page?: number; size?: number }) =>
    ["admin", "battles", "pending", params] as const,
  detail: (battleId: number) => ["admin", "battles", "detail", battleId] as const,
  analysis: (battleId: number) =>
    ["admin", "battles", "analysis", battleId] as const,
  report: (battleId: number) => ["admin", "battles", "report", battleId] as const,
};
