import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelBattle } from "../api/adminBattleApi";
import { adminBattleKeys } from "./battle.keys";

export function useCancelBattleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (battleId: number) => cancelBattle(battleId),
    onSuccess: (_data, battleId) => {
      queryClient.invalidateQueries({ queryKey: adminBattleKeys.all });
      queryClient.invalidateQueries({ queryKey: adminBattleKeys.detail(battleId) });
    },
  });
}
