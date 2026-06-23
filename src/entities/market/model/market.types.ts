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

export type AdminMarketCategory =
  | "PRICE_INDEX"
  | "TRANSACTION_VOLUME"
  | "ACTUAL_PRICE"
  | "POLICY_EVENT";

export type AdminMarketMetricUnit = "PERCENT" | "COUNT" | "KRW" | "INDEX_POINT";

export type MarketPriceModel = "POOL_SHARE";

/** market-service RegionScope enum (CreateMarketRequest.regionScope, swagger.json에는 누락되어 백엔드 소스 기준으로 확인). */
export type MarketRegionScope = "NON_REGIONAL" | "NATIONAL" | "REGIONAL";

/**
 * POST /api/v1/admin/markets 요청의 선택지 1건. swagger.json은 rangeMin/rangeMax/virtualPoolAmount를
 * number로 표기하지만, 다른 Decimal 필드와 동일하게 string으로 보내도 서버가 파싱한다(§12 Decimal 정책 유지).
 */
export type CreateMarketOptionRequest = {
  optionCode: string;
  optionText: string;
  displayOrder?: number;
  rangeMin?: string | null;
  rangeMax?: string | null;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  virtualPoolAmount?: string;
};

/**
 * POST /api/v1/admin/markets 요청 (CreateMarketRequest). regionScope/regionSido/regionSigu는
 * swagger.json에 없지만 market-service의 실제 CreateMarketRequest.java에는 존재한다(백엔드 소스 확인,
 * swagger 재수출 필요). regionScope 정책:
 * - NON_REGIONAL: regionSido/regionSigu 모두 null이어야 함
 * - NATIONAL: regionSido는 null 또는 "전국"만 허용(서버가 "전국"으로 정규화), regionSigu는 null
 * - REGIONAL: regionSido 필수(단 "전국" 불가), regionSigu는 선택
 */
export type CreateMarketRequest = {
  title: string;
  description?: string;
  category: AdminMarketCategory;
  answerType: MarketAnswerType;
  metricUnit?: AdminMarketMetricUnit;
  regionScope: MarketRegionScope;
  regionSido?: string | null;
  regionSigu?: string | null;
  judgeDataSource: string;
  judgeCriteria: string;
  judgeDate: string;
  closeAt: string;
  settleDueAt?: string;
  feeRate?: string;
  createdBy: number;
  options: CreateMarketOptionRequest[];
};

/**
 * POST /api/v1/admin/markets 응답 (CreateMarketResponse.java 기준). swagger.json에는 marketId만 있고,
 * 백엔드 소스 기준으로는 regionScope/regionSido/regionSigu도 내려준다. status 필드는 응답에 없다
 * (생성 직후 항상 PENDING이므로 별도로 받지 않아도 됨).
 */
export type CreateMarketResponse = {
  marketId: number;
  regionScope: MarketRegionScope;
  regionSido: string | null;
  regionSigu: string | null;
};

/** PATCH /api/v1/admin/markets/{marketId}/activate 응답. */
export type ActivateMarketResponse = {
  marketId: number;
  status: MarketStatus;
};

/** swagger.json AdminMarketOption 기준. Decimal 필드는 프로젝트 정책상 string으로 취급(§12). */
export type AdminMarketOption = MarketOption & {
  optionCode?: string;
  displayOrder?: number;
  rangeMin?: string | null;
  rangeMax?: string | null;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  priceChangeRate?: string;
  effectivePoolAmount?: string;
  totalContractQuantity?: string;
  predictionCount?: number;
  /** 정답 선택지 여부 (SETTLED 이후에만 의미 있음). */
  isResult?: boolean;
};

/** GET /api/v1/admin/markets/{marketId} 응답의 settlementSummary. row가 없으면 settlementId/status는 null, count는 0. */
export type AdminMarketDetailSettlementSummary = {
  settlementId: number | null;
  status: AdminMarketSettlementStatus | null;
  totalDetailCount: number;
  successCount: number;
  failedCount: number;
  unknownCount: number;
  pendingCount: number;
  updatedAt: string | null;
};

/** GET /api/v1/admin/markets/{marketId} 응답의 refundSummary. row가 없으면 voidId/status는 null, count는 0. */
export type AdminMarketDetailRefundSummary = {
  voidId: number | null;
  reasonType: AdminMarketRefundReasonType | null;
  refundStatus: AdminMarketRefundStatus | null;
  refundRequired: boolean;
  totalDetailCount: number;
  successCount: number;
  failedCount: number;
  unknownCount: number;
  pendingCount: number;
  updatedAt: string | null;
};

/**
 * GET /api/v1/admin/markets/{marketId} 응답 (AdminMarketDetailResponse, swagger.json 2026-06 기준).
 * public MarketDetail과 필드 구성이 달라(예: totalPoolAmount 없음, totalRealPoolAmount 등으로 대체)
 * 더 이상 MarketDetail을 합성하지 않고 admin 응답 전용으로 독립 정의한다.
 *
 * 주의: pendingPredictionCount는 이 swagger 스키마에 없다. ResultConfirmCard가 이 필드로
 * 결과 확정 가능 여부를 판단하고 있는데, 백엔드가 실제로 이 필드를 내려주는지 확인이 필요하다.
 * 확인 전까지는 optional로 남겨 기존 화면이 깨지지 않게 한다.
 */
export type AdminMarketDetail = {
  marketId: number;
  title: string;
  description?: string | null;
  category: AdminMarketCategory;
  answerType: MarketAnswerType;
  metricUnit: AdminMarketMetricUnit;
  status: MarketStatus;
  displayStatus: MarketDisplayStatus;
  canPredict: boolean;
  priceModel: MarketPriceModel;
  closeAt: string;
  judgeDate: string | null;
  settleDueAt: string | null;
  settledAt: string | null;
  feeRate: string;
  feeAmount: string | null;
  settlementPool: string | null;
  judgeDataSource?: string | null;
  judgeCriteria?: string | null;
  resultOptionId: number | null;
  resultValue: string | null;
  resultText: string | null;
  totalRealPoolAmount: string;
  totalVirtualPoolAmount: string;
  totalEffectivePoolAmount: string;
  totalPredictionCount: number;
  options: AdminMarketOption[];
  settlementSummary: AdminMarketDetailSettlementSummary;
  refundSummary: AdminMarketDetailRefundSummary;
  /** @deprecated 스펙/swagger에 없는 필드. 백엔드 확인 필요(market.types.ts 상단 주석 참고). */
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
  /** 2026-06 swagger 갱신으로 추가된 필드. */
  dataPending: number;
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

// ---- Market 댓글 (MARKET_API_SPEC.md §3-1) ----

export type MarketCommentListParams = {
  page?: number;
  size?: number;
};

export type MarketComment = {
  commentId: number;
  marketId: number;
  memberId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketCommentCreateRequest = {
  content: string;
};

/** GET /api/v1/markets/{marketId}/comments 응답. number/first 필드는 쓰지 않는다(MARKET_API_SPEC.md §3-1 참고). */
export type MarketCommentPageResponse = {
  content: MarketComment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

/** DELETE /api/v1/markets/{marketId}/comments/{commentId} 응답. soft delete. */
export type MarketCommentDeleteResponse = {
  commentId: number;
  deleted: boolean;
};

// ---- 관리자 정산/환불 조회 (swagger.json 기준, 2026-06 갱신) ----

export type AdminMarketSettlementStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export type AdminMarketRefundStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export type AdminMarketRefundReasonType =
  | "DATA_UNAVAILABLE"
  | "ADMIN_ERROR"
  | "MARKET_CANCELLED"
  | "NO_TRANSACTION"
  | "ETC";

/** 정산/환불 detail item의 처리 상태. */
export type AdminMarketDetailItemStatus = "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN";

/** GET /api/v1/admin/markets/{marketId}/settlements 응답. 정산 row가 없으면 id/status 계열은 null, count는 0. */
export type AdminMarketSettlementSummary = {
  marketId: number;
  marketTitle: string;
  marketStatus: MarketStatus;
  settlementId: number | null;
  settlementStatus: AdminMarketSettlementStatus | null;
  resultOptionId: number | null;
  resultOptionText: string | null;
  /** Decimal. swagger 스키마는 number로 표기되어 있으나 MARKET_API_SPEC §1-2/§9 기준
   * 정산 응답은 BigDecimalPlainStringSerializer로 String 직렬화된다고 명시되어 있어 string으로 취급한다.
   * 실제 응답이 number로 내려오면 이 타입과 파싱 로직을 다시 확인해야 한다. */
  totalPool: string;
  feeRate: string;
  feeAmount: string;
  settlementPool: string;
  winningContractQuantity: string;
  payoutPerContract: string;
  burnedPointAmount: string;
  totalDetailCount: number;
  successCount: number;
  failedCount: number;
  unknownCount: number;
  pendingCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminMarketSettlementDetailListParams = {
  page?: number;
  size?: number;
  status?: AdminMarketDetailItemStatus;
};

/**
 * GET /api/v1/admin/markets/{marketId}/settlements/{settlementId}/details 응답의 content item.
 * (AdminSettlementDetailResponse, MARKET_API_SPEC.md 부록 "정산 조회" 2026-06 갱신 기준으로 분리됨)
 */
export type AdminMarketSettlementDetailItem = {
  settlementDetailId: number;
  settlementId: number;
  predictionId: number;
  memberId: number;
  selectedOptionId: number;
  /** 정산 당시 Prediction 원금 스냅샷(market_settlement_detail.original_point_amount). Decimal string. */
  pointAmount: string;
  contractQuantity: string;
  settledAmount: string;
  profitAmount: string;
  status: AdminMarketDetailItemStatus;
  failureReason: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminMarketSettlementDetailPage = {
  content: AdminMarketSettlementDetailItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

/**
 * GET /api/v1/admin/markets/{marketId}/refunds/{voidId}/details 응답의 content item.
 * (AdminRefundDetailResponse, 정산 전용 필드 미포함)
 */
export type AdminMarketRefundDetailItem = {
  refundDetailId: number;
  voidId: number;
  predictionId: number;
  memberId: number;
  /** 참여 포인트(Prediction 기준). Decimal string. */
  pointAmount: string;
  refundAmount: string;
  status: AdminMarketDetailItemStatus;
  failureReason: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

/** GET /api/v1/admin/markets/{marketId}/refunds 응답. void row가 없으면 id/status 계열은 null, count는 0. */
export type AdminMarketRefundSummary = {
  marketId: number;
  marketTitle: string;
  marketStatus: MarketStatus;
  voidId: number | null;
  reasonType: AdminMarketRefundReasonType | null;
  reasonDetail: string | null;
  refundStatus: AdminMarketRefundStatus | null;
  refundRequired: boolean;
  /** Decimal string. AdminMarketSettlementSummary.totalPool 주석 참고. */
  totalRefundAmount: string;
  totalDetailCount: number;
  successCount: number;
  failedCount: number;
  unknownCount: number;
  pendingCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminMarketRefundDetailListParams = AdminMarketSettlementDetailListParams;

export type AdminMarketRefundDetailPage = {
  content: AdminMarketRefundDetailItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

/** PATCH /api/v1/admin/markets/{marketId}/void 요청. */
export type VoidMarketRequest = {
  reasonCode: AdminMarketRefundReasonType;
  reason: string;
};

/** PATCH /api/v1/admin/markets/{marketId}/void 응답. */
export type VoidMarketResponse = {
  marketId: number;
  voidId: number;
  status: MarketStatus;
  refundRequired: boolean;
  refundablePredictionCount: number;
  reasonCode: AdminMarketRefundReasonType;
  reason: string;
};

/** POST /api/v1/admin/markets/{marketId}/refunds, POST .../refunds/retry 공통 응답. */
export type RefundMarketResponse = {
  marketId: number;
  voidId: number;
  refundTargetCount: number;
  successCount: number;
  failedCount: number;
  unknownCount: number;
  marketStatus: MarketStatus;
  refundStatus: AdminMarketRefundStatus;
};

/** POST /api/v1/admin/markets/{marketId}/settlements, POST .../settlements/retry 공통 응답. */
export type SettleMarketResponse = {
  marketId: number;
  settlementId: number;
  resultOptionId: number;
  /** Decimal string. AdminMarketSettlementSummary.totalPool 주석 참고. */
  totalPool: string;
  feeAmount: string;
  settlementPool: string;
  winningContractQuantity: string;
  payoutPerContract: string;
  burnedPointAmount: string;
  winnerCount: number;
  loserCount: number;
  successCount: number;
  failedCount: number;
  marketStatus: MarketStatus;
  settlementStatus: AdminMarketSettlementStatus;
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
