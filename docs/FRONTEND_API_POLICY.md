# FRONTEND_API_POLICY.md

## 1. 문서 목적

이 문서는 Todongsan Frontend에서 백엔드 API를 호출하는 기준을 정의한다.

본 문서는 백엔드 API 명세 자체를 대체하지 않는다.  
API endpoint, request field, response field, errorCode의 원본 기준은 각 백엔드 도메인 API 명세서, API Gateway 명세서, Swagger/OpenAPI 문서이다.

프론트엔드는 해당 API 계약을 기준으로 다음 코드를 작성한다.

- API client
- Request/Response DTO type
- TanStack Query hook
- Mutation hook
- Error handling
- Polling logic
- Cache invalidation

---

## 2. API 계약 기준

프론트엔드는 다음 문서를 API 계약의 기준으로 삼는다.

| 문서 | 용도 |
|---|---|
| `API_GATEWAY_SPEC.md` | Gateway 라우팅, 인증, 포트, 외부/내부 API 구분 기준 |
| `MEMBER_POINT_API_SPEC.md` | 인증, 회원, 포인트 API 계약 |
| `MEMBER_POINT_ERROR_CODE.md` | 회원/포인트 도메인 에러 처리 기준 |
| `BATTLE_API_SPEC.md` | Battle API 계약 |
| `BATTLE_ERROR_CODE.md` | Battle 도메인 에러 처리 기준 |
| `MARKET_API_SPEC.md` | Market API 계약 |
| `MARKET_ERROR_CODE.md` | Market 도메인 에러 처리 기준 |
| `INSIGHT_API_SPEC.md` | Insight/Reputation API 계약 |
| `INSIGHT_ERROR_CODE.md` | Insight/Reputation 도메인 에러 처리 기준 |
| Swagger/OpenAPI | 실제 구현과 동기화된 API 확인용 |

### 2.1 Swagger/OpenAPI 기준의 의미

"Swagger 기준으로 API를 만든다"는 말은 프론트엔드가 API를 설계한다는 뜻이 아니다.

정확한 의미는 다음과 같다.

```text
백엔드가 정의한 API 계약을 기준으로
프론트 API 호출 코드와 타입을 작성한다.
```

프론트엔드는 endpoint, request field, response field, errorCode를 임의로 생성하거나 변경하지 않는다.

### 2.2 API 명세와 Swagger가 다를 경우

백엔드 API 명세서와 Swagger/OpenAPI가 서로 다를 경우 프론트에서 임의 판단하지 않는다.

처리 순서:

```text
1. 차이점 기록
2. 담당 도메인 개발자에게 확인
3. 백엔드 API 명세 또는 Swagger 중 하나로 기준 동기화
4. 프론트 타입/API client 반영
```

---

## 3. API 연동 구조

프론트엔드는 API Gateway를 통해 백엔드 도메인 서비스와 통신한다.

```text
Browser / Frontend
  ↓
API Gateway
  ↓
Backend Domain Services
  ├─ member-point-service
  ├─ battle-service
  ├─ market-service
  └─ insight-reputation-service
```

프론트엔드는 개별 백엔드 서비스 포트를 직접 호출하지 않는다.

### 3.1 Gateway 기본 주소

로컬 통합 환경의 기본 Gateway 주소는 다음과 같다.

```env
VITE_API_BASE_URL=http://localhost:9000
```

개별 서비스 포트는 다음과 같지만, 프론트의 기본 호출 대상이 아니다.

| 서비스 | 포트 | 프론트 직접 호출 여부 |
|---|---:|---|
| API Gateway | 9000 | O |
| member-point-service | 8080 | X |
| battle-service | 8081 | X |
| market-service | 8082 | X |
| insight-reputation-service | 8083 | X |

### 3.2 예외: 단독 서비스 개발 테스트

Gateway 없이 특정 서비스만 단독 실행하여 임시 테스트해야 하는 경우, 로컬에서만 `VITE_API_BASE_URL`을 해당 서비스 주소로 변경할 수 있다.

예시:

```env
# market-service 단독 테스트 시에만 임시 사용
VITE_API_BASE_URL=http://localhost:8082
```

단, 이 방식은 로컬 임시 테스트 전용이다.  
PR에 단독 서비스 baseURL을 하드코딩하거나 커밋하지 않는다.

---

## 4. 외부 API와 내부 API 구분

### 4.1 프론트 호출 대상

프론트엔드는 Gateway에 공개된 외부 API만 호출한다.

```text
/api/v1/members/**
/api/v1/points/**
/api/v1/battles/**
/api/v1/markets/**
/api/v1/admin/markets/**
/api/v1/insights/**
```

### 4.2 프론트 호출 금지 대상

프론트엔드는 `/internal/**` API를 호출하지 않는다.

```text
/internal/**
/api/v1/internal/**
/internal/api/v1/**
```

내부 API는 백엔드 서비스 간 직접 호출 전용이다.  
프론트 화면에서 필요해 보이는 데이터가 내부 API에만 있다면, 프론트에서 내부 API를 직접 호출하지 말고 해당 도메인 담당자에게 외부 API 제공 여부를 확인한다.

---

## 5. 인증 / 권한 정책

### 5.1 운영/통합 환경

운영/통합 환경에서는 다음 구조를 따른다.

```text
Frontend
  → Authorization: Bearer {accessToken}
  → API Gateway
  → JWT 검증
  → X-Member-Id, X-Member-Role downstream 전달
```

프론트는 `Authorization` 헤더만 전송한다.  
`X-Member-Id`, `X-Member-Role`은 Gateway가 JWT claim 기준으로 주입한다.

### 5.2 로컬 단독 개발

Gateway 없이 특정 서비스를 직접 호출하는 경우에 한해 개발용 헤더 주입을 허용한다.

```text
X-Member-Id: {devMemberId}
X-Member-Role: USER | ADMIN
```

단, 이 방식은 로컬 단독 테스트 전용이다.

### 5.3 권한 처리 기준

- 프론트의 role은 UI 표시용으로만 사용한다.
- 관리자 메뉴 노출 여부는 프론트에서 처리할 수 있다.
- 최종 ADMIN 권한 검증은 Gateway 및 백엔드 서비스에서 수행한다.
- 프론트에서 권한을 최종 판단하지 않는다.

---

## 6. 환경 변수 정책

### 6.1 `.env.local`

```env
VITE_API_BASE_URL=http://localhost:9000
VITE_DEV_MEMBER_ID=
VITE_DEV_MEMBER_ROLE=
```

### 6.2 `.env.example`

```env
VITE_API_BASE_URL=http://localhost:9000
VITE_DEV_MEMBER_ID=
VITE_DEV_MEMBER_ROLE=
```

### 6.3 금지사항

- `.env.local` 커밋 금지
- 실제 accessToken/refreshToken 커밋 금지
- 운영 API URL 코드 하드코딩 금지
- 로컬 테스트용 memberId/role 커밋 금지

---

## 7. HTTP Client 정책

### 7.1 기본 원칙

모든 API 요청은 `shared/api/httpClient.ts`를 통해 수행한다.

컴포넌트에서 `axios.get`, `axios.post`, `fetch`를 직접 호출하지 않는다.

### 7.2 예시 구조

```text
shared/api/
├─ httpClient.ts
├─ apiResponse.ts
└─ apiError.ts
```

### 7.3 Request Interceptor

Request interceptor는 다음을 처리한다.

- `VITE_API_BASE_URL` 기반 baseURL 적용
- accessToken이 있으면 `Authorization: Bearer {accessToken}` 추가
- 로컬 단독 개발 환경에서만 `X-Member-Id`, `X-Member-Role` 추가
- mutation 요청에서 전달받은 `Idempotency-Key` 유지

### 7.4 Response Interceptor

Response interceptor는 다음을 처리한다.

- 공통 ApiResponse unwrap 여부 결정
- 공통 에러 객체 변환
- 401 인증 만료 처리
- 네트워크 오류 처리
- 서버 응답 body가 없는 예외 처리

---

## 8. 공통 응답 타입

백엔드 공통 응답은 다음 형식을 따른다.

```ts
export type ApiResponse<T> = {
  success: boolean;
  errorCode: string | null;
  message: string | null;
  data: T;
  timestamp: string;
};
```

### 8.1 성공 응답 처리

API 함수는 가능한 한 `data.data`를 반환한다.

```ts
export async function getMarketDetail(marketId: number): Promise<MarketDetail> {
  const response = await httpClient.get<ApiResponse<MarketDetail>>(
    `/api/v1/markets/${marketId}`,
  );

  return response.data.data;
}
```

### 8.2 실패 응답 처리

실패 응답은 `errorCode`를 기준으로 처리한다.

```ts
export type ApiError = {
  status?: number;
  errorCode: string;
  message: string;
  timestamp?: string;
};
```

---

## 9. ErrorCode 처리 정책

### 9.1 기본 원칙

- HTTP status만 보고 처리하지 않는다.
- 백엔드 응답의 `errorCode`를 우선 기준으로 처리한다.
- 사용자 메시지는 백엔드 `message`를 기본 사용한다.
- 프론트에서 별도 메시지가 필요한 경우 `errorCode`별 매핑을 사용한다.
- 도메인별 ErrorCode를 프론트에서 임의로 생성하지 않는다.

### 9.2 공통 에러 처리 예시

| ErrorCode | 프론트 처리 |
|---|---|
| `UNAUTHORIZED` | 인증 만료 처리 |
| `FORBIDDEN` | 권한 없음 안내 |
| `VALIDATION_FAILED` | 입력값 확인 안내 |
| `RESOURCE_NOT_FOUND` / `NOT_FOUND` | 리소스 없음 안내 |
| `INTERNAL_ERROR` | 일시 오류 안내 |
| `EXTERNAL_SERVICE_TIMEOUT` | 처리 상태 확인 또는 재시도 안내 |
| `EXTERNAL_SERVICE_UNAVAILABLE` | 일시 장애 안내 |

### 9.3 도메인 에러 처리 예시

| ErrorCode | 프론트 처리 |
|---|---|
| `POINT_INSUFFICIENT` | 포인트 부족 안내 |
| `MEMBER_ALREADY_DELETED` | 인증 상태 초기화 후 로그인 이동 |
| `BATTLE_ALREADY_VOTED` | 이미 투표함 안내 |
| `BATTLE_CLOSED` | 종료된 Battle 안내 |
| `MARKET_ALREADY_PREDICTED` | 이미 예측 참여함 안내 |
| `MARKET_INVALID_STATUS` | 현재 상태에서 처리 불가 안내 |
| `MARKET_PREDICTION_NOT_FOUND` | 내 예측 없음 안내 |
| `INSIGHT_REPORT_ALREADY_PROCESSING` | 분석 진행 중 안내 |
| `VISIT_CERT_COOLDOWN` | 재인증 가능 시점 안내 |

---

## 10. 인증 만료 처리 정책

응답 인터셉터에서 `401 UNAUTHORIZED` 또는 인증 관련 `errorCode`가 감지되면 공통 인증 만료 처리 로직을 수행한다.

MVP 단계에서는 다음 순서로 처리한다.

```text
1. Zustand authStore 초기화
2. localStorage/sessionStorage의 accessToken 제거
3. 사용자에게 로그인 만료 안내 toast 표시
4. /login 페이지로 redirect
```

추후 refresh token 기반 자동 재발급 정책이 도입될 경우 다음 순서를 따른다.

```text
1. accessToken 만료 감지
2. refresh token으로 재발급 요청
3. 재발급 성공 시 원 요청 재시도
4. 재발급 실패 시 authStore 초기화 후 /login 이동
```

동시에 여러 요청에서 401이 발생할 수 있으므로, refresh token 재발급 도입 시에는 중복 재발급 요청을 막는 queue 또는 lock 정책을 추가한다.

---

## 11. API 함수 작성 위치

### 11.1 레이어 기준

API 함수는 도메인 성격에 따라 `entities` 또는 `features`에 둔다.

```text
entities/{domain}/api/
features/{action}/api/
```

### 11.2 조회 API

도메인 자체 조회 API는 `entities`에 둔다.

예시:

```text
entities/member/api/memberApi.ts
entities/point/api/pointApi.ts
entities/battle/api/battleApi.ts
entities/market/api/marketApi.ts
entities/insight/api/insightApi.ts
entities/reputation/api/reputationApi.ts
```

### 11.3 Mutation API

사용자 행동 단위 mutation은 `features`에 둔다.

예시:

```text
features/login-with-kakao/api/loginWithKakaoApi.ts
features/create-battle-vote/api/createBattleVoteApi.ts
features/create-prediction/api/createPredictionApi.ts
features/create-market/api/createMarketApi.ts
features/confirm-market-result/api/confirmMarketResultApi.ts
features/create-visit-certification/api/createVisitCertificationApi.ts
```

### 11.4 컴포넌트 직접 호출 금지

컴포넌트에서 `httpClient`를 직접 호출하지 않는다.

권장 흐름:

```text
Component
  → Query/Mutation Hook
  → API Function
  → httpClient
```

---

## 12. TanStack Query 정책

### 12.1 Query Key 위치

Query key는 각 entity의 `model`에 둔다.

```text
entities/market/model/market.keys.ts
entities/battle/model/battle.keys.ts
entities/member/model/member.keys.ts
entities/point/model/point.keys.ts
entities/insight/model/insight.keys.ts
entities/reputation/model/reputation.keys.ts
```

### 12.2 Query Key 예시

```ts
export const marketKeys = {
  all: ["markets"] as const,
  list: (params: MarketListParams) => ["markets", "list", params] as const,
  detail: (marketId: number) => ["markets", "detail", marketId] as const,
  quote: (marketId: number, params: MarketQuoteParams) =>
    ["markets", "quote", marketId, params] as const,
  priceHistory: (marketId: number, optionId?: number) =>
    ["markets", "price-history", marketId, optionId] as const,
};

export const predictionKeys = {
  all: ["predictions"] as const,
  my: (marketId: number) => ["predictions", "me", marketId] as const,
};
```

### 12.3 서버 상태 중복 저장 금지

서버에서 조회한 데이터를 Zustand에 복사 저장하지 않는다.

금지 예시:

```text
마켓 목록을 Zustand에 저장
Battle 상세를 Zustand에 저장
내 예측 상태를 Zustand에 저장
포인트 히스토리를 Zustand에 저장
```

---

## 13. Cache Invalidation 정책

### 13.1 예측 참여 성공 후

```ts
queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) });
queryClient.invalidateQueries({ queryKey: marketKeys.priceHistory(marketId) });
queryClient.invalidateQueries({ queryKey: predictionKeys.my(marketId) });
queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
```

### 13.2 Battle 투표 성공 후

```ts
queryClient.invalidateQueries({ queryKey: battleKeys.detail(battleId) });
queryClient.invalidateQueries({ queryKey: battleKeys.result(battleId) });
queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
```

### 13.3 관리자 Market 상태 변경 후

```ts
queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) });
queryClient.invalidateQueries({ queryKey: adminMarketKeys.detail(marketId) });
queryClient.invalidateQueries({ queryKey: adminMarketKeys.all });
```

### 13.4 Insight 리포트 생성 요청 후

```ts
queryClient.invalidateQueries({ queryKey: insightKeys.report(referenceType, referenceId) });
queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
```

---

## 14. Polling 정책

### 14.1 Market 예측 상태 polling

`POINT_PENDING`, `POINT_UNKNOWN`은 최종 실패 상태로 처리하지 않는다.

해당 상태에서는 사용자에게 다음과 같은 메시지를 표시한다.

```text
예측 참여 처리 상태를 확인 중입니다. 잠시 후 결과가 반영됩니다.
```

그리고 3~5초 간격으로 내 예측 조회 API를 polling한다.

```http
GET /api/v1/markets/{marketId}/predictions/me
```

Polling은 다음 조건에서 중단한다.

- 상태가 `CONFIRMED`로 변경된 경우
- 상태가 `FAILED`로 변경된 경우
- 상태가 `SETTLED`, `REFUNDED` 등 후속 최종 상태로 변경된 경우
- 사용자가 페이지를 벗어난 경우
- 정해진 최대 재시도 횟수 또는 최대 대기 시간을 초과한 경우

최대 대기 시간을 초과한 경우 실패로 단정하지 않고 다음 안내를 표시한다.

```text
처리 상태를 확인할 수 없습니다. 잠시 후 다시 확인해주세요.
```

### 14.2 구현 예시

```ts
useQuery({
  queryKey: predictionKeys.my(marketId),
  queryFn: () => getMyPrediction(marketId),
  refetchInterval: (query) => {
    const status = query.state.data?.status;

    if (status === "POINT_PENDING" || status === "POINT_UNKNOWN") {
      return 5000;
    }

    return false;
  },
});
```

### 14.3 Insight 리포트 polling

Insight 리포트가 `PENDING` 또는 `PROCESSING` 상태로 응답하는 경우, 해당 API 명세의 polling 기준을 따른다.

프론트는 리포트 생성 요청 직후 완료로 단정하지 않고, 상태 조회 API로 최종 상태를 확인한다.

---

## 15. Idempotency-Key 정책

### 15.1 기본 원칙

멱등성이 필요한 mutation 요청에는 `Idempotency-Key`를 포함한다.

대상 예시:

- Market 예측 참여
- 포인트 소비가 발생하는 Insight 리포트 생성
- 기타 중복 요청 방지가 필요한 포인트 변경 요청

### 15.2 Market 예측 참여

Market 예측 참여 API의 클라이언트용 `Idempotency-Key`는 다음 형식을 따른다.

```text
MARKET_PREDICTION_SPEND:market:{marketId}:member:{memberId}
```

주의:

- 클라이언트가 보내는 key에는 `attemptNo`를 포함하지 않는다.
- `optionId`를 포함하지 않는다.
- 요청 중 버튼을 disabled 처리한다.
- 같은 화면 요청 흐름에서는 동일 key를 유지한다.
- 명확한 실패 후 재시도 정책은 백엔드 상태와 에러코드 기준을 따른다.

### 15.3 UUID 방식 전환 가능성

추후 백엔드 정책이 UUID 기반 Idempotency-Key 방식으로 변경될 수 있다.  
이 경우 프론트는 API 명세 변경에 맞춰 key 생성 유틸만 수정한다.

Idempotency-Key 생성 로직은 반드시 `shared/lib/createIdempotencyKey.ts`에 캡슐화한다.

---

## 16. Decimal 처리 정책

### 16.1 기본 원칙

백엔드에서 내려온 Decimal 계열 값은 프론트에서 `string`으로 취급한다.

대상 예시:

```text
pointAmount
pointBalance
currentPrice
priceSnapshot
contractQuantity
realPoolAmount
virtualPoolAmount
settlementAmount
refundAmount
feeRate
resultValue
```

### 16.2 금지사항

컴포넌트, feature, page 레이어에서 Decimal 문자열을 직접 number로 변환하지 않는다.

금지 예시:

```ts
Number(currentPrice);
parseFloat(contractQuantity);
parseInt(pointAmount);
```

### 16.3 포맷팅 / 연산 기준

화면 표시용 포맷팅 또는 불가피한 클라이언트 연산이 필요한 경우, 내장 `Number` 객체 대신 `decimal.js` 또는 `bignumber.js` 같은 안전한 Decimal 라이브러리를 사용한다.

Decimal 라이브러리 사용은 다음 위치로 캡슐화한다.

```text
shared/lib/formatDecimal.ts
shared/lib/decimal.ts
```

권장 예시:

```ts
formatPointAmount(pointAmount);
formatMarketPrice(currentPrice);
formatPercent(priceSnapshot);
```

MVP에서는 가능한 한 백엔드에서 내려준 값을 그대로 표시하고, 프론트 계산은 최소화한다.

---

## 17. Request / Response Type 정책

### 17.1 타입 작성 기준

- 백엔드 API 명세를 기준으로 작성한다.
- 응답 타입은 API response의 `data` 필드를 기준으로 작성한다.
- Decimal 필드는 `string`으로 작성한다.
- 날짜/시간 필드는 우선 `string`으로 작성한다.
- 백엔드 enum 문자열을 프론트에서 임의 변경하지 않는다.

### 17.2 타입 네이밍

```text
{Domain}{Action}Request
{Domain}{Action}Response
{Domain}Summary
{Domain}Detail
```

예시:

```ts
export type MarketListResponse = {
  content: MarketSummary[];
  page: number;
  size: number;
  totalElements: number;
};

export type CreatePredictionRequest = {
  optionId: number;
  pointAmount: string;
};
```

---

## 18. API Domain Group 기준

초기 프론트 API 파일은 다음 단위로 구성한다.

```text
entities/member/api/memberApi.ts
entities/point/api/pointApi.ts
entities/battle/api/battleApi.ts
entities/market/api/marketApi.ts
entities/insight/api/insightApi.ts
entities/reputation/api/reputationApi.ts
```

기능 단위 mutation이 커지면 `features`로 분리한다.

```text
features/create-battle-vote/api/createBattleVoteApi.ts
features/create-prediction/api/createPredictionApi.ts
features/create-insight-report/api/createInsightReportApi.ts
```

---

## 19. 로딩 / 빈 화면 / 에러 UI 기준

API를 사용하는 화면은 최소 다음 상태를 처리한다.

```text
loading
empty
error
success
```

### 19.1 목록 화면

- loading: Skeleton 표시
- empty: 데이터 없음 안내
- error: errorCode/message 기반 안내
- success: 목록 표시

### 19.2 상세 화면

- loading: 상세 skeleton 표시
- error: not found 또는 접근 불가 안내
- success: 상세 표시

### 19.3 Mutation

- 요청 중 버튼 disabled
- 성공 시 toast 또는 상태 전환
- 실패 시 errorCode 기반 toast/form error 표시

---

## 20. 금지사항

다음 작업을 금지한다.

- 컴포넌트에서 `axios` 또는 `fetch` 직접 호출
- API URL 하드코딩
- `/internal/**` API 호출
- 백엔드에 없는 endpoint 임의 생성
- 백엔드 enum/errorCode 임의 변경
- 서버 데이터를 Zustand에 중복 저장
- Decimal 값을 `Number`, `parseFloat`, `parseInt`로 직접 변환
- 운영 코드에서 `X-Member-Id`, `X-Member-Role` 직접 주입
- 401 처리를 화면마다 개별 구현
- `POINT_UNKNOWN`, `POINT_PENDING`을 즉시 실패로 처리
- mutation 중복 클릭 방지 누락
- API 명세와 다른 request/response 타입 작성

---

## 21. PR 체크리스트

API 연동 PR은 다음 항목을 확인한다.

```text
[ ] API 계약 문서 또는 Swagger/OpenAPI를 확인했다.
[ ] VITE_API_BASE_URL을 사용했다.
[ ] 컴포넌트에서 API를 직접 호출하지 않았다.
[ ] ApiResponse<T> 타입을 적용했다.
[ ] errorCode 기반 에러 처리를 고려했다.
[ ] 401 인증 만료 처리를 공통 interceptor에 위임했다.
[ ] Decimal 값을 string으로 유지했다.
[ ] 필요한 mutation에 Idempotency-Key를 포함했다.
[ ] POINT_PENDING / POINT_UNKNOWN 상태를 polling으로 처리했다.
[ ] 성공 후 필요한 query invalidation을 수행했다.
[ ] /internal/** API를 호출하지 않았다.
```

---

## 23. 내 예측 목록 조회 API

### Endpoint

```http
GET /api/v1/markets/predictions/me?page=0&size=20
```

### 설명

마이페이지에서 로그인 사용자가 자신이 참여한 Market Prediction 목록을 조회한다.

Gateway가 JWT 인증 후 주입한 `X-Member-Id` 기준으로 조회한다.  
Market Service는 JWT를 직접 파싱하지 않는다.

이 API는 Market 목록을 조회한 뒤 각 Market마다 `/predictions/me`를 반복 호출하는 N+1 방식을 대체하기 위한 사용자 전용 목록 API다.

기존 단건 API와 혼동하지 않는다.

| API | 용도 |
|---|---|
| `GET /api/v1/markets/{marketId}/predictions/me` | 특정 Market 상세에서 내 예측 상태 조회, POINT_PENDING/POINT_UNKNOWN polling |
| `GET /api/v1/markets/predictions/me` | 마이페이지에서 내가 참여한 Market Prediction 목록 조회 |

### Query Parameters

| 이름                    | 타입       | 필수 | 설명                                                 |
| --------------------- | -------- | -- | -------------------------------------------------- |
| page                  | int      | X  | 페이지 번호. 기본값 0                                      |
| size                  | int      | X  | 페이지 크기. 기본값 20                                     |
| marketDisplayStatus   | string[] | X  | 프론트 표시용 Market 상태 필터. 반복 파라미터와 콤마 구분 모두 지원         |
| predictionStatus      | string[] | X  | Prediction 상태 필터. 반복 파라미터와 콤마 구분 모두 지원             |

#### marketDisplayStatus enum

| 값                       | 조건                                      |
| ----------------------- | --------------------------------------- |
| `ACTIVE`                | `market.status = ACTIVE && closeAt > now` |
| `CLOSED_BY_TIME`        | `market.status = ACTIVE && closeAt <= now` |
| `PENDING`               | DB status 기반                            |
| `CLOSED`                | DB status 기반                            |
| `DATA_PENDING`          | DB status 기반                            |
| `SETTLEMENT_IN_PROGRESS` | DB status 기반                            |
| `SETTLED`               | DB status 기반                            |
| `VOIDED`                | DB status 기반                            |

`ACTIVE`와 `CLOSED_BY_TIME`은 DB `market.status`만으로 구분되지 않는다.  
`closeAt`과 현재 시각을 비교해 서버가 계산한 표시용 상태다.

#### predictionStatus enum

```text
POINT_PENDING
POINT_UNKNOWN
CONFIRMED
FAILED
SETTLED
REFUND_PENDING
REFUND_UNKNOWN
REFUNDED
```

#### 필터 사용 예시

```http
# 진행 중인 마켓의 내 예측만 조회
GET /api/v1/markets/predictions/me?marketDisplayStatus=ACTIVE

# 마감된 마켓의 내 예측만 조회
GET /api/v1/markets/predictions/me?marketDisplayStatus=CLOSED_BY_TIME

# 처리 중 상태인 내 예측만 조회 (반복 파라미터)
GET /api/v1/markets/predictions/me?predictionStatus=POINT_PENDING&predictionStatus=POINT_UNKNOWN

# 처리 중 상태인 내 예측만 조회 (콤마 구분)
GET /api/v1/markets/predictions/me?predictionStatus=POINT_PENDING,POINT_UNKNOWN

# 마감된 마켓의 확정된 예측만 조회 (AND 조건)
GET /api/v1/markets/predictions/me?marketDisplayStatus=CLOSED_BY_TIME&predictionStatus=CONFIRMED
```

#### 필터 조건 정책

- `marketDisplayStatus`와 `predictionStatus`를 함께 전달하면 **AND 조건**으로 동작한다.
- 같은 파라미터를 여러 값으로 전달하면 **OR 조건**으로 동작한다.
- 필터 결과가 없어도 404가 아니라 200 + `content: []`를 반환한다.

### Headers

| 이름          | 필수 | 설명                           |
| ----------- | -- | ---------------------------- |
| X-Member-Id | O  | Gateway가 JWT 인증 후 주입하는 회원 ID |

### Response

참여 내역이 없는 경우 404가 아니라 200 + 빈 content를 반환한다.

```json
{
  "success": true,
  "errorCode": null,
  "message": null,
  "data": {
    "content": [
      {
        "predictionId": 100,
        "marketId": 1,
        "marketTitle": "Gateway E2E Negative",
        "marketStatus": "ACTIVE",
        "marketDisplayStatus": "CLOSED_BY_TIME",
        "canPredict": false,
        "selectedOptionId": 2,
        "selectedOptionContent": "YES",
        "pointAmount": "50.00",
        "priceSnapshot": "0.50000000",
        "contractQuantity": "100.00000000",
        "predictionStatus": "CONFIRMED",
        "closeAt": "2026-06-16T10:41:00",
        "settledAmount": null,
        "refundAmount": null
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  },
  "timestamp": "2026-06-17T12:00:00"
}
```

빈 목록 응답:

```json
{
  "success": true,
  "errorCode": null,
  "message": null,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0,
    "last": true
  },
  "timestamp": "2026-06-17T12:00:00"
}
```

### Item 필드 설명

| 필드                    | 타입      | 설명                                                        |
| --------------------- | ------- | --------------------------------------------------------- |
| predictionId          | Long    | Prediction ID                                             |
| marketId              | Long    | Market ID                                                 |
| marketTitle           | String  | Market 제목                                                 |
| marketStatus          | String  | DB 기준 Market 상태                                           |
| marketDisplayStatus   | String  | 프론트 표시용 Market 상태. `CLOSED_BY_TIME` 등 DB status와 다를 수 있음 |
| canPredict            | Boolean | 현재 시점 기준 예측 참여 가능 여부                                      |
| selectedOptionId      | Long    | 사용자가 선택한 option ID                                        |
| selectedOptionContent | String  | 사용자가 선택한 option 표시명                                       |
| pointAmount           | String  | 예측 참여 포인트. Decimal String                                 |
| priceSnapshot         | String? | 체결 가격. Decimal String. POINT_PENDING/POINT_UNKNOWN이면 null 가능 |
| contractQuantity      | String? | 계약 수량. Decimal String. POINT_PENDING/POINT_UNKNOWN이면 null 가능 |
| predictionStatus      | String  | Prediction 상태                                             |
| closeAt               | String  | Market 마감 시각                                              |
| settledAmount         | String? | 정산 지급 금액. Decimal String. 정산 전이면 null 가능                  |
| refundAmount          | String? | 환불 금액. Decimal String. 환불 전이면 null 가능                     |

### 상태/null 정책

`POINT_PENDING`, `POINT_UNKNOWN` 상태에서는 아래 필드가 null일 수 있다.

```text
priceSnapshot
contractQuantity
```

프론트는 이 경우 "확인 중" 또는 "처리 중"으로 표시한다.

### 발생 가능한 ErrorCode

| ErrorCode         | HTTP Status | 설명                   |
| ----------------- | ----------- | -------------------- |
| VALIDATION_FAILED | 400         | page/size 요청 값 검증 실패 |

인증 실패는 Gateway 공통 인증 정책에서 처리된다. Market ErrorCode로 분류하지 않는다.

### 프론트 구현 참고

- 이 API는 단건 조회 API(`GET /api/v1/markets/{marketId}/predictions/me`)와 별도로 구현한다.
- 마이페이지에서 내 예측 목록 형태로 사용한다.
- polling은 이 목록 API가 아니라 단건 조회 API(`GET /api/v1/markets/{marketId}/predictions/me`)를 통해 수행한다.
- `MARKET_PREDICTION_NOT_FOUND`는 단건 API에서만 발생하며, 이 목록 API에서는 발생하지 않는다.
- Decimal 필드(`pointAmount`, `priceSnapshot`, `contractQuantity`, `settledAmount`, `refundAmount`)는 section 16 Decimal 처리 정책을 따라 `string`으로 유지한다.

---

## 22. 최종 요약

Todongsan Frontend의 API 연동 기준은 다음과 같다.

```text
API 계약 기준: 도메인 API_SPEC + API_GATEWAY_SPEC + Swagger/OpenAPI
호출 구조: Frontend → API Gateway → Backend Domain Services
기본 Gateway URL: http://localhost:9000
프론트 호출 대상: /api/v1/** 외부 API
프론트 호출 금지: /internal/** 내부 API
인증: Authorization Bearer Token
권한: Gateway/Backend 최종 검증
서버 상태: TanStack Query
에러 처리: errorCode 기준
인증 만료: 401 interceptor 공통 처리
POINT_PENDING / POINT_UNKNOWN: polling
Decimal: string 유지, utility 내부에서만 안전한 라이브러리 사용
```

본 문서는 백엔드 API 계약, Gateway 라우팅, 인증 방식, 에러 처리 정책이 변경될 경우 함께 업데이트한다.
