import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rejectBattle } from "../api/adminBattleApi";
import { adminBattleKeys } from "./battle.keys";

export function useRejectBattleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (battleId: number) => rejectBattle(battleId),
    onSuccess: (_data, battleId) => {
      queryClient.invalidateQueries({ queryKey: adminBattleKeys.all });
      queryClient.invalidateQueries({ queryKey: adminBattleKeys.detail(battleId) });
    },
  });
}
