import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { getAdminMarketInsightPriceHistory } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useAdminMarketInsightPriceHistoryQuery(marketId: number) {
  return useQuery({
    queryKey: insightKeys.adminMarketPriceHistory(marketId),
    queryFn: () => getAdminMarketInsightPriceHistory(marketId),
    enabled: Number.isFinite(marketId) && marketId > 0,
    retry: (failureCount, error) => {
      // 404는 데이터 없음으로 처리 — 재시도 없이 즉시 종료
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
}
