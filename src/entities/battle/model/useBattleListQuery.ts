import { useQuery } from "@tanstack/react-query";

import { getBattleList } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { BattleListParams } from "./battle.types";

export function useBattleListQuery(params: BattleListParams) {
  return useQuery({
    queryKey: battleKeys.list(params),
    queryFn: () => getBattleList(params),
  });
}
