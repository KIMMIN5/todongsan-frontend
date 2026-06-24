import { useQuery } from "@tanstack/react-query";

import { getMarketComments } from "../api/marketCommentApi";
import { marketKeys } from "./market.keys";
import type { MarketCommentListParams } from "./market.types";

export function useMarketCommentListQuery(
  marketId: number,
  params: MarketCommentListParams = {},
) {
  return useQuery({
    queryKey: marketKeys.commentList(marketId, params),
    queryFn: () => getMarketComments(marketId, params),
    enabled: Number.isFinite(marketId) && marketId > 0,
  });
}
