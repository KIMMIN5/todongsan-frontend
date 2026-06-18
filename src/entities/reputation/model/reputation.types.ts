import type { BaseEntity } from '@/shared/types/common';

// 방문 인증 방법
export type VisitCertMethod = 'GPS' | 'COMMENT';

// 방문 인증 상태
export type VisitCertStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

// 신뢰도 정보
export interface Reputation extends BaseEntity {
  memberId: number;
  activityScore: number; // 활동 점수
  predictionCount: number; // 총 예측 횟수
  predictionCorrect?: number; // 맞춘 예측 횟수 (본인 조회시만)
  predictionAccuracy: number; // 예측 정확도 (%)
  residenceSido?: string;
  residenceSigu?: string;
  residenceChangedAt?: string; // 마지막 거주지 변경 일시 (쿨다운 계산용)
  activityConfirmed: boolean; // 활동 지역 인증 여부
  activityConfirmedAt?: string;
  visitCertifications?: VisitCertification[]; // 방문 인증 내역 (본인 조회시)
  visitCertificationCount?: number; // 방문 인증 횟수 (타인 조회시)
}

// 방문 인증
export interface VisitCertification extends BaseEntity {
  certificationId: number;
  memberId: number;
  sido: string;
  sigu: string;
  method: VisitCertMethod;
  status?: VisitCertStatus;
  certifiedAt: string;
  lastCertifiedAt: string;
  nextAvailableDate: string; // 다음 인증 가능 날짜
  gpsLatitude?: number; // GPS 인증시
  gpsLongitude?: number; // GPS 인증시
  commentId?: number; // 댓글 기반 인증시
  reviewNote?: string; // 검토 메모 (관리자용)
}

// 신뢰도 랭킹
export interface ReputationRanking {
  rank: number;
  memberId: number;
  nickname: string;
  activityScore: number;
  predictionAccuracy: number;
  residenceSido?: string;
  residenceSigu?: string;
}

// 거주지 변경 요청
export interface UpdateResidenceRequest {
  residenceSido: string;
  residenceSigu: string;
}

// 방문 인증 요청 (GPS)
export interface CreateVisitCertGPSRequest {
  sido: string;
  sigu: string;
  latitude: number;
  longitude: number;
}

// 방문 인증 요청 (댓글 기반)
export interface CreateVisitCertCommentRequest {
  sido: string;
  sigu: string;
  commentId: number;
}

// 방문 인증 목록 요청 파라미터
export interface VisitCertListParams {
  page?: number;
  size?: number;
  method?: VisitCertMethod;
  status?: VisitCertStatus;
  sido?: string;
  sigu?: string;
}

// 신뢰도 랭킹 요청 파라미터
export interface ReputationRankingParams {
  page?: number;
  size?: number;
  sido?: string;
  sigu?: string;
  sort?: 'activityScore' | 'predictionAccuracy';
}

// GPS 데이터
export interface GpsData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

// 지역별 신뢰도 통계
export interface RegionReputationStats {
  sido: string;
  sigu?: string;
  memberCount: number;
  averageActivityScore: number;
  averagePredictionAccuracy: number;
  visitCertificationCount: number;
}