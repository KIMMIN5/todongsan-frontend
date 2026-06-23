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
  commentCount?: number;
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

// 배틀 생성 (POST /api/v1/battles)
// startAt/endAt은 타임존 없는 LocalDateTime 문자열 ("YYYY-MM-DDTHH:mm:ss")
export type CreateBattleRequest = {
  title: string;
  optionA: string;
  optionB: string;
  description?: string; // 요청에는 있으나 응답에는 포함되지 않음
  sido?: string;
  sigu?: string;
  startAt: string;
  endAt: string;
};

// 생성 응답 (status는 생성 직후 항상 "PENDING")
export type CreateBattleResponse = {
  battleId: number;
  title: string;
  optionA: string;
  optionB: string;
  sido: string | null;
  sigu: string | null;
  status: BattleStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
};

// ---- 파라미터 ----

export type BattleListParams = {
  status?: BattleListStatus;
  sort?: "popular";
  page?: number;
  size?: number;
};

export type BattleCommentListParams = {
  page?: number;
  size?: number;
};

// ---- 내 참여(투표) 배틀 목록 (GET /api/v1/battles/votes/me) ----

// 응답 item. 정산 전이면 winningOption/isWin/rewardAmount/settledAt은 null
export type MyBattleVoteItem = {
  battleId: number;
  title: string;
  optionA: string;
  optionB: string;
  sido: string | null;
  sigu: string | null;
  status: BattleStatus;
  selectedOption: BattleOption; // 내가 투표한 선택지
  winningOption: WinningOption | null;
  isWin: boolean | null;
  rewardAmount: string | null; // Decimal → string
  settledAt: string | null;
  votedAt: string;
  startAt: string;
  endAt: string;
};

export type MyBattleVoteListParams = {
  status?: BattleListStatus[]; // ACTIVE/CLOSED, 콤마 직렬화
  page?: number;
  size?: number;
};

// ---- 내가 만든 배틀 목록 (GET /api/v1/battles/created/me) ----

// 생성자 본인 조회라 PENDING/CANCELLED 포함 전체 상태가 내려옴
export type MyCreatedBattleItem = {
  battleId: number;
  title: string;
  optionA: string;
  optionB: string;
  sido: string | null;
  sigu: string | null;
  status: BattleStatus;
  voteCount: number;
  winningOption: WinningOption | null;
  settledAt: string | null;
  startAt: string;
  endAt: string;
  createdAt: string;
};

export type MyCreatedBattleListParams = {
  status?: BattleStatus[]; // PENDING/ACTIVE/CLOSED/CANCELLED, 콤마 직렬화
  page?: number;
  size?: number;
};

// ---- 관리자 전용 ----

export type AdminBattlePendingListParams = {
  page?: number;
  size?: number;
};

// PATCH approve/reject/cancel 응답 (battleId + 변경된 status)
export type AdminBattleStatusResponse = {
  battleId: number;
  status: BattleStatus;
};
