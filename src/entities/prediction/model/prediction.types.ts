import type { BaseEntity } from '@/shared/types/common';

// 예측 상태 (market.types.ts와 동일하지만 예측 도메인에서 별도 관리)
export type PredictionStatus = 
  | 'POINT_PENDING'
  | 'POINT_UNKNOWN' 
  | 'CONFIRMED'
  | 'FAILED'
  | 'SETTLED'
  | 'REFUND_PENDING'
  | 'REFUND_UNKNOWN'
  | 'REFUNDED';

// 예측 상세 정보
export interface Prediction extends BaseEntity {
  predictionId: number;
  marketId: number;
  memberId: number;
  optionId: number;
  pointAmount: string; // Decimal as string
  priceSnapshot: string; // 예측 당시 가격
  contractQuantity: string; // 계약 수량
  fee: string; // 수수료
  status: PredictionStatus;
  estimatedSettlementAmount?: string; // 예상 정산 금액
  actualSettlementAmount?: string; // 실제 정산 금액
  idempotencyKey?: string; // 중복 요청 방지용 키
  attemptNo: number; // 재시도 번호
  createdAt: string;
  settledAt?: string;
  refundedAt?: string;
}

// 예측 요약 정보
export interface PredictionSummary {
  predictionId: number;
  marketTitle: string;
  optionContent: string;
  pointAmount: string;
  status: PredictionStatus;
  estimatedSettlementAmount?: string;
  actualSettlementAmount?: string;
  createdAt: string;
}

// 예측 참여 결과
export interface PredictionResult {
  predictionId: number;
  marketId: number;
  optionId: number;
  pointAmount: string;
  priceSnapshot: string;
  contractQuantity: string;
  fee: string;
  status: PredictionStatus;
  createdAt: string;
}

export type MyMarketPrediction = {
  predictionId: number;
  marketId: number;
  selectedOptionId: number;
  pointAmount: string;
  priceSnapshot: string | null;
  contractQuantity: string | null;
  status: PredictionStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateMarketPredictionRequest = {
  marketOptionId: number;
  pointAmount: string;
};

export type CreateMarketPredictionResponse = {
  predictionId: number;
  marketId: number;
  selectedOptionId: number;
  pointAmount: string;
  priceSnapshot: string | null;
  contractQuantity: string | null;
  status: PredictionStatus;
};

// 내 예측 목록 요청 파라미터
export interface MyPredictionListParams {
  page?: number;
  size?: number;
  status?: PredictionStatus;
  marketId?: number;
  sort?: string;
}

// 예측 통계 정보
export interface PredictionStats {
  totalPredictions: number;
  confirmedPredictions: number;
  settledPredictions: number;
  totalPointsSpent: string;
  totalPointsEarned: string;
  winRate?: number; // 성공률 (%)
}
