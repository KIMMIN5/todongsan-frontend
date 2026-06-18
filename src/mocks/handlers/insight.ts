import { http, HttpResponse } from 'msw';

export const insightHandlers = [
  // 내 신뢰도 조회
  http.get('/api/v1/reputations/me', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        memberId: 1,
        activityScore: 85,
        predictionCount: 12,
        predictionCorrect: 8,
        predictionAccuracy: 66.67,
        residenceSido: '서울특별시',
        residenceSigu: '강남구',
        activityConfirmed: true,
        activityConfirmedAt: '2024-12-05T10:00:00',
        visitCertifications: [
          {
            sido: '서울특별시',
            sigu: '강남구',
            method: 'GPS',
            certifiedAt: '2024-12-05T10:00:00',
            lastCertifiedAt: '2024-12-10T14:30:00',
            nextAvailableDate: '2024-12-17T14:30:00',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 다른 사용자 신뢰도 조회
  http.get('/api/v1/reputations/:memberId', ({ params }) => {
    const memberId = Number(params.memberId);

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        memberId,
        activityScore: 72,
        predictionCount: 8,
        predictionAccuracy: 75.0,
        residenceSido: '서울특별시',
        residenceSigu: '서초구',
        activityConfirmed: true,
        activityConfirmedAt: '2024-11-20T15:00:00',
        visitCertificationCount: 2,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 방문 인증 등록
  http.post('/api/v1/reputations/visit-certifications', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: '방문 인증이 등록되었습니다.',
      data: {
        certificationId: 1,
        memberId: 1,
        sido: '서울특별시',
        sigu: '강남구',
        method: 'GPS',
        certifiedAt: new Date().toISOString(),
        nextAvailableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 내 방문 인증 내역 조회
  http.get('/api/v1/reputations/visit-certifications/mine', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: [
        {
          certificationId: 1,
          sido: '서울특별시',
          sigu: '강남구',
          method: 'GPS',
          certifiedAt: '2024-12-05T10:00:00',
          lastCertifiedAt: '2024-12-10T14:30:00',
          nextAvailableDate: '2024-12-17T14:30:00',
        },
        {
          certificationId: 2,
          sido: '서울특별시',
          sigu: '서초구',
          method: 'COMMENT',
          certifiedAt: '2024-11-20T15:00:00',
          lastCertifiedAt: '2024-11-20T15:00:00',
          nextAvailableDate: '2024-11-27T15:00:00',
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }),

  // 마켓 AI 리포트 생성 요청
  http.post('/api/v1/insights/markets/:marketId/report', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: 'AI 리포트 생성이 요청되었습니다.',
      data: {
        reportId: 1,
        marketId: 1,
        status: 'PROCESSING',
        pointDeducted: '80.00',
        requestedAt: new Date().toISOString(),
        estimatedCompleteAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5분 후
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 마켓 AI 리포트 조회
  http.get('/api/v1/insights/markets/:marketId/report', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        reportId: 1,
        marketId: 1,
        status: 'DONE',
        title: '강남구 아파트 가격 상승률 분석 리포트',
        summary: '최근 5년간 강남구 아파트 시장 동향과 2024년 전망에 대한 종합 분석입니다.',
        content: '## 시장 동향 분석\n\n강남구 아파트 시장은...\n\n## 가격 예측 요소\n\n1. 금리 정책\n2. 공급량 변화\n3. 경기 전망\n\n## 결론\n\n종합적으로 볼 때...',
        generatedAt: '2024-12-10T15:35:00',
        pointDeducted: '80.00',
        requestedAt: '2024-12-10T15:30:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 마켓 AI 리포트 상태 조회
  http.get('/api/v1/insights/markets/:marketId/report/status', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        reportId: 1,
        status: 'DONE',
        progress: 100,
        estimatedCompleteAt: '2024-12-10T15:35:00',
        generatedAt: '2024-12-10T15:35:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 사용자 배틀 AI 리포트 생성 요청
  http.post('/api/v1/insights/battles/:battleId/report', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: 'AI 리포트 생성이 요청되었습니다.',
      data: {
        reportId: 2,
        type: 'BATTLE',
        referenceId: 1,
        status: 'PROCESSING',
        pointDeducted: '80.00',
        requestedAt: new Date().toISOString(),
        estimatedCompleteAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 사용자 배틀 AI 리포트 상태 조회 (폴링용)
  http.get('/api/v1/insights/battles/:battleId/report/status', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        reportId: 2,
        status: 'DONE',
        progress: 100,
        generatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 사용자 배틀 AI 리포트 조회
  http.get('/api/v1/insights/battles/:battleId/report', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        reportId: 2,
        type: 'BATTLE',
        referenceId: 1,
        status: 'DONE',
        title: '강남구 vs 서초구 실거주 선호도 배틀 AI 분석',
        summary: '총 342명이 참여한 이번 배틀에서 마포 래미안 푸르지오(A)가 57.6%로 우세했습니다. 30대 남성과 서울 거주자에서 A 선택 비율이 높게 나타났으며, 40대 이상에서는 B 선택 비율이 역전되었습니다.',
        content: '## 투표 패턴 분석\n\n### 연령별 분포\n- 20대: A 62% / B 38%\n- 30대: A 61% / B 39%\n- 40대: A 49% / B 51%\n- 50대 이상: A 44% / B 56%\n\n### 지역별 분포\n- 서울 거주: A 60% / B 40%\n- 경기 거주: A 54% / B 46%\n- 기타 지역: A 52% / B 48%\n\n## 주요 인사이트\n\n젊은 층일수록 역세권·브랜드 선호도가 높게 나타났고, 40대 이상에서는 단지 규모와 커뮤니티를 더 중시하는 경향이 관찰됩니다.',
        generatedAt: new Date().toISOString(),
        pointDeducted: '80.00',
        requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 거주지역 선언/변경
  http.put('/api/v1/reputations/me/residence', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: '거주지역이 업데이트되었습니다.',
      data: {
        memberId: 1,
        activityScore: 85,
        predictionCount: 12,
        predictionAccuracy: 66.67,
        residenceSido: '서울특별시',
        residenceSigu: '성동구',
        residenceChangedAt: new Date().toISOString(),
        activityConfirmed: true,
        activityConfirmedAt: '2024-12-05T10:00:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 관리자 배틀 AI 리포트 조회
  http.get('/api/v1/admin/insights/battles/:battleId/report', () => {
    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        reportId: 1,
        battleId: 1,
        status: 'DONE',
        title: '강남구 vs 서초구 부동산 배틀 분석 리포트',
        summary: '두 지역의 부동산 시장 예측 배틀에 대한 AI 분석 결과입니다.',
        content: '## 배틀 개요\n\n이번 배틀은 강남구와 서초구의 부동산 상승률을 두고...\n\n## 예측 분석\n\n참여자들의 예측 패턴을 분석한 결과...\n\n## 최종 결론\n\n데이터에 기반한 종합 분석에 따르면...',
        generatedAt: '2024-12-11T09:00:00',
        requestedAt: '2024-12-11T08:50:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),
];