import type { AdminMarketProblemType } from "../model/market.types";

export const PROBLEM_TYPE_LABELS: Record<AdminMarketProblemType, string> = {
  PREDICTION_RECONCILE: "예측 정합",
  SETTLEMENT: "정산",
  REFUND: "환불",
  REPUTATION: "평판",
};
