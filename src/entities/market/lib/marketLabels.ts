/**
 * 마켓/예측 화면 표시 용어 단일 소스 (예측 게임 톤).
 *
 * 도박/투기·트레이딩 톤을 피한다. 포인트는 가상 포인트이며 금융 상품처럼 보이게 하지 않는다.
 * 작업 6-2/6-3에서도 이 라벨을 재사용한다. (하드코딩 문자열 분산 금지)
 */
export const MARKET_LABELS = {
  /** currentPrice — 선택지의 현재 Pool Share 가격(집단 예측 수준). 확정 확률 아님 */
  predictionRate: "예측률",
  /** priceSnapshot — 참여 확정 시점의 예측률 */
  entryPredictionRate: "참여 시 예측률",
  /** pointAmount — 내가 사용한 포인트 */
  entryPoint: "참여 포인트",
  /** contractQuantity — 적중 시 보상 풀에서 가져가는 몫(고정 지급권 아님). 단위 없이 표기 */
  winShare: "적중 지분",
  /** estimatedPayoutIfWin — 원금 + 예상 보상 ("예상" 필수) */
  estimatedPayoutIfWin: "적중 시 예상 정산금",
  /** estimatedProfitIfWin — 예상 정산금 − 원금(순이익, "예상" 필수) */
  estimatedProfitIfWin: "적중 시 예상 보상",
  /** currentPayoutPerContract — 적중 지분 1당 추가 보상(원금 미포함) */
  payoutPerShareEstimated: "지분당 예상 보상",
  /** payoutPerContract — 정산 시 확정 보상(원금 미포함) */
  payoutPerShareFinal: "지분당 확정 보상",
  /** settledAmount / settlementAmount — 실제 지급액(미적중 0.00) */
  settlementAmount: "정산금",
  /** profitAmount — 정산금 − 참여 포인트 */
  profitAmount: "손익",
  /** refundAmount — 환불액 */
  refundAmount: "환불 포인트",
  /** totalRealPoolAmount — 실제 참여 포인트 총합 */
  liquidity: "유동성",
} as const;

/** 오해 방지용 보조 캡션 (단정 금지, 게임 톤). */
export const MARKET_CAPTIONS = {
  /** 예측률이 "확정 확률"로 오해되지 않도록 */
  predictionRate: "실시간 참여에 따라 변동되는 집단 예측 수준입니다.",
  /** 적중 지분이 "고정 지급권"으로 오해되지 않도록 */
  winShare:
    "적중하면 이 지분 비율만큼 보상을 나눠 받습니다. 일찍·낮은 예측률에 참여할수록 커집니다.",
} as const;
