export type MarketStatus =
  | "PENDING"
  | "ACTIVE"
  | "CLOSED"
  | "DATA_PENDING"
  | "SETTLEMENT_IN_PROGRESS"
  | "SETTLED"
  | "VOIDED";

export type MarketDisplayStatus =
  | "PENDING"
  | "ACTIVE"
  | "CLOSED_BY_TIME"
  | "DATA_PENDING"
  | "CLOSED"
  | "SETTLEMENT_IN_PROGRESS"
  | "SETTLED"
  | "VOIDED";

export type MarketListParams = {
  page?: number;
  size?: number;
  status?: MarketStatus;
  displayStatus?: MarketDisplayStatus;
  sort?: string;
  keyword?: string;
};

export type MarketPriceHistoryParams = {
  page?: number;
  size?: number;
  optionId?: number;
};

export type MarketPredictionQuoteRequest = {
  marketOptionId: number;
  pointAmount: string;
};

export type MarketListResponse = {
  content: MarketSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MarketSummary = {
  marketId: number;
  title: string;
  status: MarketStatus;
  canPredict: boolean;
  displayStatus: MarketDisplayStatus;
  closeAt: string;
  totalPoolAmount: string;
  /** 실제 참여 풀(인기 정렬 기준). 응답에 없으면 totalPoolAmount로 폴백. Decimal string */
  totalRealPoolAmount?: string;
  options: MarketOption[];
};

export type MarketOption = {
  optionId: number;
  content: string;
  initialPrice?: string;
  currentPrice: string;
  realPoolAmount?: string;
  virtualPoolAmount?: string;
};

export type MarketDetail = MarketSummary & {
  description?: string;
  resultAnnounceAt?: string;
};

export type MarketAnswerType = "YES_NO" | "MULTIPLE_CHOICE" | "NUMERIC_RANGE";

export type AdminMarketOption = MarketOption & {
  rangeMin?: string;
  rangeMax?: string;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  totalContractQuantity?: string;
};

/** 정산/환불 요약. 백엔드 고정 스키마가 확정되지 않아 키를 그대로 노출한다. */
export type MarketSummaryRecord = Record<string, string | number | boolean | null>;

/** GET /api/v1/admin/markets/{marketId} 응답. */
export type AdminMarketDetail = Omit<MarketDetail, "options"> & {
  answerType: MarketAnswerType;
  options: AdminMarketOption[];
  settlementSummary?: MarketSummaryRecord | null;
  refundSummary?: MarketSummaryRecord | null;
  /** 처리 대기 중인(POINT_PENDING/POINT_UNKNOWN) 예측 건수. 응답에 없으면 알 수 없음(undefined)으로 취급. */
  pendingPredictionCount?: number;
};

/** PATCH /api/v1/admin/markets/{marketId}/result 요청. */
export type AdminMarketResultRequest = {
  resultOptionId?: number;
  resultValue?: string;
  resultText?: string;
};

export type MarketPriceHistoryResponse = {
  content: MarketPriceHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MarketPriceHistoryItem = {
  historyId: number;
  marketId: number;
  optionId: number;
  optionContent: string;
  predictionId: number;
  eventType: string;
  priceBefore: string;
  priceAfter: string;
  priceChangeRate: string;
  realPoolBefore: string;
  realPoolAfter: string;
  virtualPoolAmount: string;
  contractQuantityBefore: string;
  contractQuantityAfter: string;
  createdAt: string;
};

/** GET /api/v1/admin/markets/status-counts 응답. 관리자 마켓 목록 탭 카운트. */
export type AdminMarketStatusCounts = {
  total: number;
  pending: number;
  active: number;
  closedByTime: number;
  closed: number;
  settlementInProgress: number;
  settled: number;
  voided: number;
  problemMarketCount: number;
};

export type AdminMarketProblemType =
  | "PREDICTION_RECONCILE"
  | "SETTLEMENT"
  | "REFUND"
  | "REPUTATION";

export type AdminMarketProblemStatus =
  | "FAILED"
  | "UNKNOWN"
  | "PENDING_STALE"
  | "NEEDS_CHECK";

export type AdminMarketProblemFilterType = "ALL" | AdminMarketProblemType;

/** GET /api/v1/admin/markets/problem-markets 쿼리 파라미터. */
export type AdminMarketProblemListParams = {
  page?: number;
  size?: number;
  type?: AdminMarketProblemFilterType;
};

export type AdminMarketProblemItem = {
  marketId: number;
  title: string;
  marketStatus: MarketStatus;
  problemType: AdminMarketProblemType;
  problemStatus: AdminMarketProblemStatus;
  failedCount: number;
  unknownCount: number;
  pendingStaleCount: number;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  lastAttemptAt?: string | null;
  autoRecoverable: boolean;
  manualCheckRequired: boolean;
};

export type AdminMarketProblemListResponse = {
  content: AdminMarketProblemItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MarketPredictionQuoteResponse = {
  marketId: number;
  selectedOptionId: number;
  pointAmount: string;
  currentPrice: string;
  estimatedContractQuantity: string;
  estimatedAfterPrice: string;
  priceImpactRate: string;
  selectedOptionEffectivePoolBefore: string;
  selectedOptionEffectivePoolAfter: string;
  totalEffectivePoolBefore: string;
  totalEffectivePoolAfter: string;
  notice: string;
};
