import { useQuery } from "@tanstack/react-query";

import { getAdminBattleDetail } from "../api/adminBattleApi";
import { adminBattleKeys } from "./battle.keys";

export function useAdminBattleDetailQuery(battleId: number) {
  return useQuery({
    queryKey: adminBattleKeys.detail(battleId),
    queryFn: () => getAdminBattleDetail(battleId),
    enabled: battleId > 0,
  });
}
