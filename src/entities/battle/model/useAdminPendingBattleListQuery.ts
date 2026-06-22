import { useQuery } from "@tanstack/react-query";

import { getAdminPendingBattles } from "../api/adminBattleApi";
import { adminBattleKeys } from "./battle.keys";
import type { AdminBattlePendingListParams } from "./battle.types";

export function useAdminPendingBattleListQuery(
  params: AdminBattlePendingListParams = {},
) {
  return useQuery({
    queryKey: adminBattleKeys.pendingList(params),
    queryFn: () => getAdminPendingBattles(params),
  });
}
