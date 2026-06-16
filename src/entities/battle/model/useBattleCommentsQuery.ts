import { useQuery } from "@tanstack/react-query";

import { getBattleComments } from "../api/battleApi";
import { battleKeys } from "./battle.keys";
import type { BattleCommentListParams } from "./battle.types";

export function useBattleCommentsQuery(
  battleId: number,
  params: BattleCommentListParams,
) {
  return useQuery({
    queryKey: battleKeys.commentsPage(battleId, params),
    queryFn: () => getBattleComments(battleId, params),
    enabled: Number.isFinite(battleId) && battleId > 0,
  });
}
