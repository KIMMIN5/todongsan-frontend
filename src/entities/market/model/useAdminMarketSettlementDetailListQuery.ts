import { useQuery } from "@tanstack/react-query";

import { getAdminMarketSettlementDetails } from "../api/adminMarketApi";
import { marketKeys } from "./market.keys";
import type { AdminMarketSettlementDetailListParams } from "./market.types";

/** settlementId가 없을 때(정산 row 없음)는 enabled를 false로 둔다. */
export function useAdminMarketSettlementDetailListQuery(
  marketId: number,
  settlementId: number | null | undefined,
  params: AdminMarketSettlementDetailListParams = {},
) {
  return useQuery({
    queryKey: marketKeys.adminSettlementDetailList(
      marketId,
      settlementId ?? 0,
      params,
    ),
    queryFn: () =>
      getAdminMarketSettlementDetails(marketId, settlementId as number, params),
    enabled:
      Number.isFinite(marketId) &&
      marketId > 0 &&
      typeof settlementId === "number" &&
      settlementId > 0,
  });
}
