import { useQuery } from "@tanstack/react-query";

import { getAdminMarketRefundDetails } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";
import type { AdminMarketRefundDetailListParams } from "./market.types";

/** voidId가 없을 때(무효 처리 row 없음)는 enabled를 false로 둔다. */
export function useAdminMarketRefundDetailListQuery(
  marketId: number,
  voidId: number | null | undefined,
  params: AdminMarketRefundDetailListParams = {},
) {
  return useQuery({
    queryKey: marketKeys.adminRefundDetailList(marketId, voidId ?? 0, params),
    queryFn: () =>
      getAdminMarketRefundDetails(marketId, voidId as number, params),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      typeof voidId === "number" &&
      voidId > 0,
  });
}
