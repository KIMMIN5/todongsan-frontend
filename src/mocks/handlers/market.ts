import { http, HttpResponse } from 'msw';

export const marketHandlers = [
  // 마켓 목록 조회
  http.get('/api/v1/markets', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 20;

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        content: [
          {
            marketId: 1,
            title: '2024년 강남구 아파트 평균 가격 상승률',
            status: 'ACTIVE',
            closeAt: '2026-12-31T23:59:59',
            totalPoolAmount: '15000.00',
            options: [
              {
                optionId: 1,
                content: '0% 이상 5% 미만',
                currentPrice: '0.65432100',
              },
              {
                optionId: 2,
                content: '5% 이상 10% 미만',
                currentPrice: '0.34567900',
              },
            ],
          },
        ],
        page,
        size,
        totalElements: 1,
        totalPages: 1,
        last: true,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 마켓 상세 조회
  http.get('/api/v1/markets/:marketId', ({ params }) => {
    const marketId = Number(params.marketId);

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        marketId,
        title: '2024년 강남구 아파트 평균 가격 상승률',
        description: '2024년 12월 기준 강남구 아파트 평균 가격이 전년 대비 몇 % 상승할까요?',
        status: 'ACTIVE',
        closeAt: '2026-12-31T23:59:59',
        resultAnnounceAt: '2027-01-15T00:00:00',
        totalPoolAmount: '15000.00',
        options: [
          {
            optionId: 1,
            content: '0% 이상 5% 미만',
            currentPrice: '0.65432100',
            realPoolAmount: '8000.00',
            virtualPoolAmount: '25000.00',
          },
          {
            optionId: 2,
            content: '5% 이상 10% 미만',
            currentPrice: '0.34567900',
            realPoolAmount: '7000.00',
            virtualPoolAmount: '25000.00',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 마켓 가격 이력 조회
  http.get('/api/v1/markets/:marketId/price-history', ({ request, params }) => {
    const url = new URL(request.url);
    const marketId = Number(params.marketId);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 50;
    const optionId = url.searchParams.get('optionId');
    const histories = [
      {
        historyId: 1,
        marketId,
        optionId: 1,
        optionContent: '0% 이상 5% 미만',
        predictionId: 101,
        eventType: 'PREDICTION_CONFIRMED',
        priceBefore: '0.58000000',
        priceAfter: '0.62000000',
        priceChangeRate: '4.00000000',
        realPoolBefore: '7600.00',
        realPoolAfter: '8000.00',
        virtualPoolAmount: '25000.00',
        contractQuantityBefore: '12.00000000',
        contractQuantityAfter: '13.52876234',
        createdAt: '2024-12-10T12:00:00',
      },
      {
        historyId: 2,
        marketId,
        optionId: 2,
        optionContent: '5% 이상 10% 미만',
        predictionId: 102,
        eventType: 'PREDICTION_CONFIRMED',
        priceBefore: '0.42000000',
        priceAfter: '0.38000000',
        priceChangeRate: '-4.00000000',
        realPoolBefore: '6900.00',
        realPoolAfter: '7000.00',
        virtualPoolAmount: '25000.00',
        contractQuantityBefore: '8.00000000',
        contractQuantityAfter: '8.90000000',
        createdAt: '2024-12-10T12:05:00',
      },
      {
        historyId: 3,
        marketId,
        optionId: 1,
        optionContent: '0% 이상 5% 미만',
        predictionId: 103,
        eventType: 'PREDICTION_CONFIRMED',
        priceBefore: '0.62000000',
        priceAfter: '0.65432100',
        priceChangeRate: '3.43210000',
        realPoolBefore: '8000.00',
        realPoolAfter: '8300.00',
        virtualPoolAmount: '25000.00',
        contractQuantityBefore: '13.52876234',
        contractQuantityAfter: '14.10000000',
        createdAt: '2024-12-10T14:00:00',
      },
    ];
    const content = optionId
      ? histories.filter((history) => String(history.optionId) === optionId)
      : histories;

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        content,
        page,
        size,
        totalElements: content.length,
        totalPages: content.length > 0 ? 1 : 0,
        last: true,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 예측 견적 요청
  http.post('/api/v1/markets/:marketId/predictions/quote', async ({ request, params }) => {
    const marketId = Number(params.marketId);
    const body = await request.json() as {
      marketOptionId?: number;
      pointAmount?: string;
    };
    const selectedOptionId = body.marketOptionId ?? 1;
    const pointAmount = body.pointAmount ?? '100.00';

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        marketId,
        selectedOptionId,
        pointAmount,
        currentPrice: '0.65432100',
        estimatedContractQuantity: '1.52876234',
        estimatedAfterPrice: '0.68932100',
        priceImpactRate: '3.50000000',
        selectedOptionEffectivePoolBefore: '33000.00',
        selectedOptionEffectivePoolAfter: '33100.00',
        totalEffectivePoolBefore: '65000.00',
        totalEffectivePoolAfter: '65100.00',
        notice:
          '현재 가격은 실시간으로 변동될 수 있으며, 실제 참여 시점의 가격 기준으로 계약 수량이 확정됩니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 예측 참여
  http.post('/api/v1/markets/:marketId/predictions', async ({ request, params }) => {
    const marketId = Number(params.marketId);
    const body = await request.json() as {
      marketOptionId?: number;
      pointAmount?: string;
    };

    // MARKET_ALREADY_PREDICTED 에러 mock: ?mockError=already_predicted 쿼리로 테스트
    const url = new URL(request.url);
    if (url.searchParams.get('mockError') === 'already_predicted') {
      return HttpResponse.json(
        {
          success: false,
          errorCode: 'MARKET_ALREADY_PREDICTED',
          message: '이미 이 마켓에 참여했습니다.',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 409 },
      );
    }

    // POINT_INSUFFICIENT mock: ?mockError=insufficient 쿼리로 테스트
    if (url.searchParams.get('mockError') === 'insufficient') {
      return HttpResponse.json(
        {
          success: false,
          errorCode: 'POINT_INSUFFICIENT',
          message: '포인트가 부족합니다.',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 422 },
      );
    }

    // POINT_UNKNOWN mock: ?mockStatus=unknown 쿼리로 테스트
    if (url.searchParams.get('mockStatus') === 'unknown') {
      return HttpResponse.json({
        success: true,
        errorCode: null,
        message: '예측 참여 처리 상태를 확인 중입니다.',
        data: {
          predictionId: 1,
          marketId,
          selectedOptionId: body.marketOptionId ?? 1,
          pointAmount: body.pointAmount ?? '100.00',
          priceSnapshot: null,
          contractQuantity: null,
          status: 'POINT_UNKNOWN',
        },
        timestamp: new Date().toISOString(),
      });
    }

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: '예측 참여가 완료되었습니다.',
      data: {
        predictionId: 1,
        marketId,
        selectedOptionId: body.marketOptionId ?? 1,
        pointAmount: body.pointAmount ?? '100.00',
        priceSnapshot: '0.65432100',
        contractQuantity: '1.52876234',
        status: 'CONFIRMED',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 내 예측 상태 조회
  http.get('/api/v1/markets/:marketId/predictions/me', ({ request, params }) => {
    const url = new URL(request.url);
    const marketId = Number(params.marketId);

    if (url.searchParams.get('empty') === 'true') {
      return HttpResponse.json(
        {
          success: false,
          errorCode: 'MARKET_PREDICTION_NOT_FOUND',
          message: '내 예측 참여를 찾을 수 없습니다.',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      errorCode: null,
      message: null,
      data: {
        predictionId: 1,
        marketId,
        selectedOptionId: 1,
        pointAmount: '100.00',
        priceSnapshot: '0.65432100',
        contractQuantity: '1.52876234',
        status: 'CONFIRMED',
        createdAt: '2024-12-10T15:30:00',
        updatedAt: '2024-12-10T15:30:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),
];
