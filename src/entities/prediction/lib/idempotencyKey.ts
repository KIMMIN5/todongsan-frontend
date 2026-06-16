export function createMarketPredictionSpendIdempotencyKey(params: {
  marketId: number;
  memberId: number | string;
}): string {
  return `MARKET_PREDICTION_SPEND:market:${params.marketId}:member:${params.memberId}`;
}
