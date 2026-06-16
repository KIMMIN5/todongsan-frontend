import { useQuery } from "@tanstack/react-query";

import { getBattleResult } from "../api/battleApi";
import { battleKeys } from "./battle.keys";

export function useBattleResultQuery(battleId: number) {
  return useQuery({
    queryKey: battleKeys.result(battleId),
    queryFn: () => getBattleResult(battleId),
    enabled: Number.isFinite(battleId) && battleId > 0,
  });
}
