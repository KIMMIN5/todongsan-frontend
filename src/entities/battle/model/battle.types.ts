// Battle 도메인 타입
// 기준: docs/battle/BATTLE_API_SPEC.md, battle-service DTO

// 배틀 상태 (CONVENTION 6-1)
export type BattleStatus = "PENDING" | "ACTIVE" | "CLOSED" | "CANCELLED";

// 투표 선택지
export type BattleOption = "A" | "B";

// 정산 결과 (winning_option)
export type WinningOption = "A" | "B" | "DRAW";

// 목록에 노출 가능한 상태 (PENDING/CANCELLED은 일반 사용자 비노출)
export type BattleListStatus = "ACTIVE" | "CLOSED";

// Spring Page 직렬화 형태 (Battle Service는 Page<T>를 그대로 응답)
export type BattlePage<T> = {
  content: T[];
  number: number; // 현재 페이지 (0-base)
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

// 목록 항목 (GET /api/v1/battles)
export type BattleSummary = {
  battleId: number;
  title: string;
  optionA: string;
  optionB: string;
  status: BattleStatus;
  voteCount: number;
  startAt: string;
  endAt: string;
  createdAt: string;
};

// 상세 (GET /api/v1/battles/{battleId})
export type BattleDetail = {
  battleId: number;
  title: string;
  optionA: string;
  optionB: string;
  sido: string | null;
  sigu: string | null;
  status: BattleStatus;
  isClosed: boolean;
  optionACount: number;
  optionBCount: number;
  voteCount: number;
  winningOption: WinningOption | null;
  rewardAmount: string; // Decimal → string 취급 (FRONTEND_API_POLICY 16)
  settledAt: string | null;
  createdBy: number;
  startAt: string;
  endAt: string;
  createdAt: string;
};

// 투표 결과 (GET /api/v1/battles/{battleId}/result)
// resultVisible=false인 경우 집계 필드는 내려오지 않을 수 있음
export type BattleResult = {
  battleId: number;
  status: BattleStatus;
  voted: boolean;
  resultVisible: boolean;
  voteCount?: number;
  optionACount?: number;
  optionBCount?: number;
  optionARatio?: number;
  optionBRatio?: number;
  winningOption?: WinningOption | null;
  message?: string | null;
};

// 투표 응답 (POST /api/v1/battles/{battleId}/votes)
export type VoteResponse = {
  battleId: number;
  selectedOption: BattleOption;
  message: string;
};

// 댓글 (GET /api/v1/battles/{battleId}/comments)
// 백엔드 응답에 nickname이 포함되지 않음 (ERD 7번: 일괄 조회 API 도입 전까지 미제공)
export type BattleComment = {
  commentId: number;
  battleId: number;
  memberId: number;
  content: string;
  createdAt: string;
};

// ---- 요청 타입 ----

export type CreateVoteRequest = {
  option: BattleOption;
};

export type CreateCommentRequest = {
  content: string;
};

// ---- 파라미터 ----

export type BattleListParams = {
  status?: BattleListStatus;
  page?: number;
  size?: number;
};

export type BattleCommentListParams = {
  page?: number;
  size?: number;
};
