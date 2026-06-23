import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { getMarketPublicDataReference } from "../api/insightApi";
import { insightKeys } from "./insight.keys";

export function useMarketPublicDataReferenceQuery(
  marketId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: insightKeys.marketPublicDataReference(marketId),
    queryFn: () => getMarketPublicDataReference(marketId),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      (options?.enabled ?? true),
    retry: (failureCount, error) => {
      // 404(존재하지 않는 마켓)는 재시도 없이 즉시 종료
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 3 * 60 * 1000, // Claude API 실시간 호출이므로 3분 캐시 유지
  });
}
