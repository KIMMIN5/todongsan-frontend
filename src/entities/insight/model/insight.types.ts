import type { BaseEntity } from '@/shared/types/common';

// 인사이트 리포트 타입
export type InsightReportType = 'MARKET' | 'BATTLE';

// 인사이트 리포트 상태
export type InsightReportStatus =
  | 'PENDING'     // 생성 대기
  | 'PROCESSING'  // 생성 중
  | 'DONE'        // 생성 완료
  | 'FAILED';     // 생성 실패

// 인사이트 리포트
export interface InsightReport extends BaseEntity {
  reportId: number;
  type: InsightReportType;
  referenceId: number; // marketId 또는 battleId
  memberId?: number; // 요청한 회원 (사용자 요청시)
  status: InsightReportStatus;
  title?: string;
  summary?: string;
  content?: string; // Markdown 형식
  generatedAt?: string;
  pointDeducted?: string; // 차감된 포인트
  requestedAt: string;
  estimatedCompleteAt?: string;
  failureReason?: string;
  analysisData?: BattleAnalysisData; // 배틀 리포트 전용 (status=DONE 일 때만 채워짐)
}

// 인사이트 리포트 요약 (목록용)
export interface InsightReportSummary {
  reportId: number;
  type: InsightReportType;
  referenceId: number;
  referenceTitle: string; // 마켓 제목 또는 배틀 제목
  status: InsightReportStatus;
  requestedAt: string;
  generatedAt?: string;
  pointDeducted?: string;
}

// 인사이트 리포트 상태 정보
export interface InsightReportStatusInfo {
  reportId: number;
  status: InsightReportStatus;
  progress?: number; // 0-100
  estimatedCompleteAt?: string;
  generatedAt?: string;
  failureReason?: string;
}

// 마켓 인사이트 리포트 생성 요청
export interface CreateMarketInsightRequest {
  marketId: number;
}

// 배틀 인사이트 리포트 생성 요청 (관리자용)
export interface CreateBattleInsightRequest {
  battleId: number;
}

// 인사이트 리포트 목록 요청 파라미터
export interface InsightReportListParams {
  page?: number;
  size?: number;
  type?: InsightReportType;
  status?: InsightReportStatus;
  memberId?: number;
  sort?: string;
}

// AI 분석 결과 데이터
export interface AnalysisData {
  summary: string;
  keyInsights: string[];
  dataPoints: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
  trends: Array<{
    period: string;
    value: number;
    change?: number;
  }>;
  recommendations?: string[];
}

// 마켓 인사이트 전용 데이터
export interface MarketInsightData extends AnalysisData {
  priceAnalysis: {
    currentPrices: Array<{
      optionId: number;
      optionContent: string;
      price: string;
      confidence: number;
    }>;
    priceDrivers: string[];
    volatilityAnalysis: string;
  };
  marketSentiment: {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    confidence: number;
    reasoning: string;
  };
}

// 배틀 인사이트 전용 데이터
export interface BattleInsightData extends AnalysisData {
  voteAnalysis: {
    optionAPercentage: number;
    optionBPercentage: number;
    totalVotes: number;
    demographicBreakdown?: Array<{
      segment: string;
      optionAPercentage: number;
      optionBPercentage: number;
    }>;
  };
  sentimentAnalysis: {
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    keyThemes: string[];
    commentAnalysis?: string;
  };
}

// ── 마켓 공공 데이터 참고 정보 (진행 중 마켓 사용자 노출용) ──────────

export type MarketPublicDataReferenceResponse = {
  title: string;
  summary: string;
  content: string;          // Markdown
  dataAsOf: string | null;  // ISO 8601, 공공 데이터 없으면 null
  aiAnalyzed: boolean;      // false = Claude 실패(공공 데이터 원문) 또는 공공 데이터 없음
};

// ── 마켓 실거래가 인사이트 ──────────────────────────────────────────

export type MarketPriceDataType = "WEEKLY_PRICE_INDEX" | "MONTHLY_PRICE_INDEX";

export type MarketPriceHistoryItem = {
  referenceDate: string; // "2024-10-07"
  value: number;
};

export type MarketPredictionDistributionItem = {
  optionLabel: string;
  ratio: number;   // 0~1
  isResult: boolean;
};

export type AdminMarketInsightPriceHistory = {
  regionSido: string | null;
  regionSigu: string | null;
  dataType: MarketPriceDataType;
  priceHistory: MarketPriceHistoryItem[];
  latestPredictionDistribution: MarketPredictionDistributionItem[];
};

// ── 관리자 인사이트 대시보드 ──────────────────────────────────────────

export type PriceDirection = "RISING" | "FALLING" | "FLAT";

// Battle analysisData (기존 배틀 리포트 응답에 포함)
export type BattleOptionDistributionItem = {
  optionLabel: string;
  count: number;
  ratio: number; // 0~1
};

export type BattleAnalysisData = {
  totalVotes: number;
  optionDistribution: BattleOptionDistributionItem[];
  genderByOption: Record<string, Record<string, number>>;   // {"찬성": {"MALE": 0.65, "FEMALE": 0.35}}
  ageGroupByOption: Record<string, Record<string, number>>; // {"찬성": {"20대": 0.51, ...}}
  visitCertifiedVotePattern: {
    certifiedVoterCount: number;
    certifiedOptionDistribution: BattleOptionDistributionItem[];
  };
};

// GET /api/v1/admin/insights/markets/{marketId}/dashboard
export type AdminMarketDashboard = {
  marketId: number;
  title: string;
  regionSido: string | null;
  regionSigu: string | null;
  priceHistory: {
    dataType: MarketPriceDataType;
    records: MarketPriceHistoryItem[];
    trendDirection: PriceDirection;
    changeRate: number | null;
  };
  predictionDistribution: MarketPredictionDistributionItem[];
  priceVsPredictionOverlay: {
    priceTrendDirection: PriceDirection;
    priceChangePct: number;
    crowdPredictedCorrectly: boolean;
    majorityOption: string;
  } | null;
  participantStats: {
    totalParticipants: number;
    totalPoolAmount: number;
    genderDistribution: Record<string, number>;   // {"MALE": 0.61, "FEMALE": 0.39}
    ageGroupDistribution: Record<string, number>; // {"20대": 0.44, "30대": 0.31, ...}
    residenceMatchRatio: number | null;
  } | null;
  visitCertStats: {
    certifiedVisitorCount: number;
    gpsCertCount: number;
    commentCertCount: number;
  };
};

// GET /api/v1/admin/insights/overview
export type AdminInsightsOverview = {
  platformStats: {
    totalMembersWithReputation: number;
    avgReputationScore: number;
    avgPredictionAccuracy: number;
    totalVisitCertifications: number;
    activeMarketsCount: number | null;
    activeBattlesCount: number | null;
  };
  reputationDistribution: Record<string, number>; // {"0-20": 0.08, "21-40": 0.23, ...}
  crowdIntelligenceScore: number;
  visitCertMethodRatio: Record<string, number>;   // {"GPS": 0.68, "COMMENT": 0.32}
  aiReportStats: {
    totalDone: number;
    totalFailed: number;
    totalPending: number;
    successRate: number; // 0~1
  };
};

// GET /api/v1/admin/insights/regions/price-map
export type RegionPriceMapItem = {
  regionSido: string;
  latestIndex: number | null;
  prevIndex: number | null;
  changePct: number | null;
  direction: PriceDirection | null;
  visitCertCount: number;
};

export type AdminRegionsPriceMap = {
  asOf: string;
  dataType: MarketPriceDataType;
  regions: RegionPriceMapItem[];
};

// GET /api/v1/admin/insights/activity/trend
export type ActivityTrendWeek = {
  weekStart: string;              // "2026-03-31"
  newVisitCerts: number;
  aiReportsCompleted: number;
  aiReportSuccessRate: number | null;
  predictionResultsProcessed: number;
};

export type AdminActivityTrend = {
  period: string;
  weeklyTrend: ActivityTrendWeek[];
};