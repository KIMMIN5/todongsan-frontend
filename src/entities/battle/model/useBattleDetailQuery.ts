import { useQuery } from "@tanstack/react-query";

import { getBattleDetail } from "../api/battleApi";
import { battleKeys } from "./battle.keys";

export function useBattleDetailQuery(battleId: number) {
  return useQuery({
    queryKey: battleKeys.detail(battleId),
    queryFn: () => getBattleDetail(battleId),
    enabled: Number.isFinite(battleId) && battleId > 0,
  });
}
